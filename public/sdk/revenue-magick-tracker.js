/**
 * Revenue Magick Tracking SDK
 * Digital Body Language™ Tracking for Conversion Spy Engine™
 * 
 * Lightweight (<50KB) asynchronous tracking library
 * Tracks 27+ behavioral signals for Neuromind Profile™ classification
 * 
 * Enhanced with Milestone 4 MVP features:
 * - Real-time event enrichment
 * - Data sanitization and anonymization
 * - Automated event posting to FB and GA
 * - CRM data integration for attribution
 * 
 * @version 1.1.0
 * @author Revenue Magick
 */

(function(window, document) {
    'use strict';

    // Configuration
    const CONFIG = {
        apiEndpoint: 'http://localhost:8000/api/v1/tracking',
        batchSize: 10,
        flushInterval: 5000, // 5 seconds
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        scrollThreshold: 0.25, // 25% scroll to trigger engagement
        hoverThreshold: 1000, // 1 second hover to be significant
        maxRetries: 3,
        retryDelay: 1000,
        // Milestone 4 MVP: Enhanced processing options
        useEnhancedProcessing: true,
        autoPostConversions: true,
        sanitizePII: true,
        enableServerSidePosting: false,
        platforms: ['facebook', 'google'],
        testMode: false
    };

    // Global state
    let isInitialized = false;
    let userId = null;
    let sessionId = null;
    let eventQueue = [];
    let flushTimer = null;
    let lastActivity = Date.now();
    let scrollDepth = 0;
    let maxScrollDepth = 0;
    let pageStartTime = Date.now();
    let ctaHoverTimes = {};
    let formInteractions = {};
    let hesitationLoops = 0;
    let backButtonClicks = 0;
    let mouseMovements = [];
    let clickCadence = [];

    // Milestone 4 MVP: Enhanced event processing state
    let crmAttributionData = null;
    let processingStatus = 'unknown';

    // Utility functions
    function generateId() {
        return 'rm_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    function getTimestamp() {
        return new Date().toISOString();
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Milestone 4 MVP: Data sanitization helper
    function sanitizeEventData(eventData) {
        if (!CONFIG.sanitizePII) return eventData;
        
        const sanitized = { ...eventData };
        
        // Remove or hash potential PII from metadata
        if (sanitized.metadata) {
            const metadata = { ...sanitized.metadata };
            
            // Remove email patterns
            Object.keys(metadata).forEach(key => {
                if (typeof metadata[key] === 'string') {
                    // Basic email pattern detection
                    if (metadata[key].includes('@') && metadata[key].includes('.')) {
                        metadata[key] = '[EMAIL_SANITIZED]';
                    }
                    // Basic phone pattern detection
                    if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(metadata[key])) {
                        metadata[key] = '[PHONE_SANITIZED]';
                    }
                }
            });
            
            sanitized.metadata = metadata;
        }
        
        return sanitized;
    }

    // Session management
    function initializeSession() {
        // Try to get existing session from localStorage
        const existingSession = localStorage.getItem('rm_session');
        const lastActivity = localStorage.getItem('rm_last_activity');
        
        if (existingSession && lastActivity) {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
            if (timeSinceLastActivity < CONFIG.sessionTimeout) {
                sessionId = existingSession;
                // Milestone 4 MVP: Load CRM attribution data if available
                loadCRMAttributionData();
                return;
            }
        }

        // Create new session
        sessionId = generateId();
        localStorage.setItem('rm_session', sessionId);
        updateLastActivity();

        // Milestone 4 MVP: Initialize processing status check
        checkProcessingStatus();

        // Send session start event
        trackEvent('session_start', null, {
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            // Milestone 4 MVP: Enhanced session metadata
            sdk_version: '1.1.0',
            enhanced_processing: CONFIG.useEnhancedProcessing,
            auto_post_conversions: CONFIG.autoPostConversions
        });
    }

    function updateLastActivity() {
        lastActivity = Date.now();
        localStorage.setItem('rm_last_activity', lastActivity.toString());
    }

    // Milestone 4 MVP: CRM Attribution Integration
    function loadCRMAttributionData() {
        if (!userId) return;
        
        fetch(`${CONFIG.apiEndpoint}/users/${userId}/crm-attribution`)
            .then(response => response.json())
            .then(data => {
                if (data.crm_attribution && data.crm_attribution.crm_match) {
                    crmAttributionData = data.crm_attribution;
                    localStorage.setItem('rm_crm_attribution', JSON.stringify(crmAttributionData));
                }
            })
            .catch(error => {
                console.warn('Revenue Magick: Failed to load CRM attribution data', error);
            });
    }

    // Milestone 4 MVP: Processing Status Check
    function checkProcessingStatus() {
        fetch(`${CONFIG.apiEndpoint}/processing/status`)
            .then(response => response.json())
            .then(data => {
                processingStatus = data.status;
                console.log('Revenue Magick: Processing pipeline status:', data.status);
            })
            .catch(error => {
                console.warn('Revenue Magick: Failed to check processing status', error);
                processingStatus = 'unknown';
            });
    }

    // Event tracking
    function trackEvent(eventType, elementId, metadata = {}) {
        if (!isInitialized) return;

        updateLastActivity();

        let event = {
            user_id: userId,
            session_id: sessionId,
            event_type: eventType,
            element_id: elementId,
            timestamp: getTimestamp(),
            metadata: {
                page_url: window.location.href,
                page_title: document.title,
                ...metadata
            }
        };

        // Milestone 4 MVP: Add CRM attribution data if available
        if (crmAttributionData) {
            event.metadata.crm_attribution = crmAttributionData;
        }

        // Milestone 4 MVP: Sanitize event data if enabled
        if (CONFIG.sanitizePII) {
            event = sanitizeEventData(event);
        }

        eventQueue.push(event);

        // Flush immediately for critical events
        const criticalEvents = ['conversion', 'form_submit', 'cta_click'];
        if (criticalEvents.includes(eventType) || eventQueue.length >= CONFIG.batchSize) {
            flushEvents();
        }
    }

    // Milestone 4 MVP: Enhanced event tracking with server-side posting
    function trackConversionEvent(eventName, customData = {}) {
        if (!isInitialized) return;

        // Track the conversion event normally
        trackEvent('conversion', null, {
            conversion_event: eventName,
            ...customData
        });

        // Milestone 4 MVP: Server-side posting if enabled
        if (CONFIG.enableServerSidePosting) {
            const eventData = {
                event_name: eventName,
                user_data: {
                    email: customData.email,
                    user_id: userId,
                    client_ip_address: customData.ip_address,
                    client_user_agent: navigator.userAgent
                },
                custom_data: {
                    value: customData.value || 0,
                    currency: customData.currency || 'USD',
                    content_name: customData.content_name,
                    ...customData
                },
                event_source_url: window.location.href
            };

            fetch(`${CONFIG.apiEndpoint}/events/server-side-post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...eventData,
                    platforms: CONFIG.platforms,
                    test_mode: CONFIG.testMode
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Revenue Magick: Server-side event posted:', data);
            })
            .catch(error => {
                console.warn('Revenue Magick: Server-side posting failed:', error);
            });
        }
    }

    // Event flushing
    function flushEvents() {
        if (eventQueue.length === 0) return;

        const events = [...eventQueue];
        eventQueue = [];

        // Milestone 4 MVP: Use enhanced processing if enabled
        if (CONFIG.useEnhancedProcessing) {
            sendEnhancedEvents(events);
        } else {
            sendEvents(events);
        }
    }

    // Milestone 4 MVP: Enhanced event sending
    function sendEnhancedEvents(events, retryCount = 0) {
        const requestData = {
            events: events.map(event => ({
                ...event,
                auto_post_conversions: CONFIG.autoPostConversions,
                sanitize_pii: CONFIG.sanitizePII
            }))
        };

        fetch(`${CONFIG.apiEndpoint}/events/batch-enhanced`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Revenue Magick: Enhanced events processed:', data);
        })
        .catch(error => {
            console.warn('Revenue Magick: Failed to send enhanced events', error);
            
            // Fallback to regular event sending
            if (retryCount < CONFIG.maxRetries) {
                setTimeout(() => {
                    sendEvents(events, retryCount + 1);
                }, CONFIG.retryDelay * Math.pow(2, retryCount));
            } else {
                // Add events back to queue for next flush
                eventQueue.unshift(...events);
            }
        });
    }

    function sendEvents(events, retryCount = 0) {
        fetch(`${CONFIG.apiEndpoint}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ events })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.warn('Revenue Magick: Failed to send events', error);
            
            // Retry logic
            if (retryCount < CONFIG.maxRetries) {
                setTimeout(() => {
                    sendEvents(events, retryCount + 1);
                }, CONFIG.retryDelay * Math.pow(2, retryCount));
            } else {
                // Add events back to queue for next flush
                eventQueue.unshift(...events);
            }
        });
    }

    // Digital Body Language™ Tracking Functions

    // 1. Scroll Velocity and Pause Detection
    function trackScrollBehavior() {
        let lastScrollTime = Date.now();
        let lastScrollTop = window.pageYOffset;
        let scrollVelocities = [];
        let scrollPauses = [];
        let isScrolling = false;
        let scrollTimer = null;

        const scrollHandler = throttle(() => {
            const currentTime = Date.now();
            const currentScrollTop = window.pageYOffset;
            const timeDiff = currentTime - lastScrollTime;
            const scrollDiff = Math.abs(currentScrollTop - lastScrollTop);
            
            if (timeDiff > 0) {
                const velocity = scrollDiff / timeDiff;
                scrollVelocities.push(velocity);
                
                // Keep only last 10 measurements
                if (scrollVelocities.length > 10) {
                    scrollVelocities.shift();
                }
            }

            // Calculate scroll depth
            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
            );
            
            scrollDepth = (window.pageYOffset + window.innerHeight) / documentHeight;
            maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);

            // Track significant scroll milestones
            const milestones = [0.25, 0.5, 0.75, 0.9];
            milestones.forEach(milestone => {
                if (scrollDepth >= milestone && !window[`rm_scroll_${milestone}`]) {
                    window[`rm_scroll_${milestone}`] = true;
                    trackEvent('scroll_milestone', null, {
                        milestone,
                        scroll_depth: scrollDepth,
                        time_to_milestone: Date.now() - pageStartTime
                    });
                }
            });

            lastScrollTime = currentTime;
            lastScrollTop = currentScrollTop;

            // Detect scroll pauses
            if (!isScrolling) {
                isScrolling = true;
            }

            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                isScrolling = false;
                const avgVelocity = scrollVelocities.reduce((a, b) => a + b, 0) / scrollVelocities.length;
                
                trackEvent('scroll_pause', null, {
                    scroll_depth: scrollDepth,
                    pause_duration: 500, // Minimum pause detection
                    avg_velocity: avgVelocity,
                    scroll_position: currentScrollTop
                });
            }, 500);

        }, 100);

        window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    // 2. CTA Hover Time Measurement
    function trackCTAHovers() {
        const ctaSelectors = [
            'button',
            'a[href]',
            '[role="button"]',
            '.btn',
            '.cta',
            '[data-track="cta"]'
        ];

        ctaSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                let hoverStartTime = null;
                let hoverCount = 0;

                element.addEventListener('mouseenter', () => {
                    hoverStartTime = Date.now();
                    hoverCount++;
                });

                element.addEventListener('mouseleave', () => {
                    if (hoverStartTime) {
                        const hoverDuration = Date.now() - hoverStartTime;
                        const elementId = element.id || element.className || element.tagName;
                        
                        if (hoverDuration >= CONFIG.hoverThreshold) {
                            trackEvent('cta_hover', elementId, {
                                hover_duration: hoverDuration,
                                hover_count: hoverCount,
                                element_text: element.textContent?.trim().substring(0, 100),
                                element_position: element.getBoundingClientRect()
                            });
                        }

                        ctaHoverTimes[elementId] = (ctaHoverTimes[elementId] || 0) + hoverDuration;
                    }
                });

                element.addEventListener('click', () => {
                    const elementId = element.id || element.className || element.tagName;
                    trackEvent('cta_click', elementId, {
                        total_hover_time: ctaHoverTimes[elementId] || 0,
                        hover_count: hoverCount,
                        element_text: element.textContent?.trim().substring(0, 100)
                    });
                });
            });
        });
    }

    // 3. Form Interaction and Abandonment Patterns
    function trackFormInteractions() {
        document.querySelectorAll('form').forEach(form => {
            const formId = form.id || form.className || 'unnamed_form';
            formInteractions[formId] = {
                fields_focused: [],
                fields_filled: [],
                start_time: null,
                abandonment_point: null
            };

            form.querySelectorAll('input, textarea, select').forEach(field => {
                const fieldName = field.name || field.id || field.type;

                field.addEventListener('focus', () => {
                    if (!formInteractions[formId].start_time) {
                        formInteractions[formId].start_time = Date.now();
                    }
                    
                    if (!formInteractions[formId].fields_focused.includes(fieldName)) {
                        formInteractions[formId].fields_focused.push(fieldName);
                    }

                    trackEvent('form_field_focus', fieldName, {
                        form_id: formId,
                        field_type: field.type,
                        field_position: Array.from(form.elements).indexOf(field)
                    });
                });

                field.addEventListener('blur', () => {
                    if (field.value.trim()) {
                        if (!formInteractions[formId].fields_filled.includes(fieldName)) {
                            formInteractions[formId].fields_filled.push(fieldName);
                        }
                    }

                    trackEvent('form_field_blur', fieldName, {
                        form_id: formId,
                        field_filled: !!field.value.trim(),
                        field_length: field.value.length
                    });
                });

                field.addEventListener('input', debounce(() => {
                    trackEvent('form_field_input', fieldName, {
                        form_id: formId,
                        input_length: field.value.length,
                        typing_speed: 'calculated' // Could implement actual typing speed
                    });
                }, 1000));
            });

            form.addEventListener('submit', () => {
                const interaction = formInteractions[formId];
                trackEvent('form_submit', formId, {
                    completion_time: Date.now() - interaction.start_time,
                    fields_focused: interaction.fields_focused.length,
                    fields_filled: interaction.fields_filled.length,
                    completion_rate: interaction.fields_filled.length / form.elements.length
                });
            });
        });
    }

    // 4. Hesitation Loop Detection (Back/Forward behavior)
    function trackHesitationLoops() {
        let navigationCount = 0;
        
        // Track back button usage
        window.addEventListener('popstate', () => {
            backButtonClicks++;
            hesitationLoops++;
            
            trackEvent('back_button_click', null, {
                navigation_count: navigationCount,
                hesitation_loops: hesitationLoops,
                time_on_page: Date.now() - pageStartTime
            });
        });

        // Track page visibility changes (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                trackEvent('page_hidden', null, {
                    time_visible: Date.now() - pageStartTime
                });
            } else {
                trackEvent('page_visible', null, {
                    return_time: Date.now()
                });
            }
        });
    }

    // 5. Click Cadence and Decisiveness Analysis
    function trackClickPatterns() {
        let lastClickTime = 0;
        let clickCount = 0;

        document.addEventListener('click', (event) => {
            const currentTime = Date.now();
            const timeSinceLastClick = currentTime - lastClickTime;
            
            clickCount++;
            clickCadence.push(timeSinceLastClick);
            
            // Keep only last 10 clicks
            if (clickCadence.length > 10) {
                clickCadence.shift();
            }

            const avgCadence = clickCadence.reduce((a, b) => a + b, 0) / clickCadence.length;
            
            trackEvent('click', event.target.id || event.target.className || event.target.tagName, {
                click_count: clickCount,
                time_since_last_click: timeSinceLastClick,
                avg_click_cadence: avgCadence,
                click_coordinates: { x: event.clientX, y: event.clientY },
                element_text: event.target.textContent?.trim().substring(0, 50)
            });

            lastClickTime = currentTime;
        });
    }

    // 6. Mouse Movement Pattern Analysis
    function trackMouseMovements() {
        let mouseTrail = [];
        let lastMouseTime = 0;

        const mouseMoveHandler = throttle((event) => {
            const currentTime = Date.now();
            const movement = {
                x: event.clientX,
                y: event.clientY,
                timestamp: currentTime,
                velocity: lastMouseTime ? 
                    Math.sqrt(Math.pow(event.clientX - mouseTrail[mouseTrail.length - 1]?.x || 0, 2) + 
                             Math.pow(event.clientY - mouseTrail[mouseTrail.length - 1]?.y || 0, 2)) / 
                    (currentTime - lastMouseTime) : 0
            };

            mouseTrail.push(movement);
            
            // Keep only last 50 movements
            if (mouseTrail.length > 50) {
                mouseTrail.shift();
            }

            lastMouseTime = currentTime;
        }, 100);

        document.addEventListener('mousemove', mouseMoveHandler);

        // Analyze mouse patterns periodically
        setInterval(() => {
            if (mouseTrail.length > 10) {
                const avgVelocity = mouseTrail.reduce((sum, m) => sum + m.velocity, 0) / mouseTrail.length;
                const totalDistance = mouseTrail.reduce((sum, m, i) => {
                    if (i === 0) return 0;
                    const prev = mouseTrail[i - 1];
                    return sum + Math.sqrt(Math.pow(m.x - prev.x, 2) + Math.pow(m.y - prev.y, 2));
                }, 0);

                trackEvent('mouse_pattern_analysis', null, {
                    avg_velocity: avgVelocity,
                    total_distance: totalDistance,
                    movement_count: mouseTrail.length,
                    analysis_period: 10000 // 10 seconds
                });
            }
        }, 10000);
    }

    // 7. Viewport Engagement Tracking
    function trackViewportEngagement() {
        const observerOptions = {
            threshold: [0.1, 0.25, 0.5, 0.75, 1.0],
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const elementId = entry.target.id || entry.target.className || entry.target.tagName;
                
                if (entry.isIntersecting) {
                    trackEvent('element_in_viewport', elementId, {
                        intersection_ratio: entry.intersectionRatio,
                        element_position: entry.boundingClientRect,
                        viewport_percentage: entry.intersectionRatio * 100
                    });
                }
            });
        }, observerOptions);

        // Observe key elements
        document.querySelectorAll('h1, h2, h3, button, .cta, form, img, video').forEach(element => {
            observer.observe(element);
        });
    }

    // 8. Page Performance and Load Time Tracking
    function trackPagePerformance() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            
            trackEvent('page_performance', null, {
                load_time: perfData.loadEventEnd - perfData.loadEventStart,
                dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                first_paint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime,
                first_contentful_paint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime,
                page_size: new Blob([document.documentElement.outerHTML]).size
            });
        });
    }

    // Main initialization function
    function init(config = {}) {
        if (isInitialized) {
            console.warn('Revenue Magick Tracker already initialized');
            return;
        }

        // Merge configuration
        Object.assign(CONFIG, config);

        // Generate or retrieve user ID
        userId = localStorage.getItem('rm_user_id') || generateId();
        localStorage.setItem('rm_user_id', userId);

        // Initialize session
        initializeSession();

        // Set up event flushing
        flushTimer = setInterval(flushEvents, CONFIG.flushInterval);

        // Initialize all tracking modules
        trackScrollBehavior();
        trackCTAHovers();
        trackFormInteractions();
        trackHesitationLoops();
        trackClickPatterns();
        trackMouseMovements();
        trackViewportEngagement();
        trackPagePerformance();

        // Track page view
        trackEvent('page_view', null, {
            page_load_time: Date.now() - pageStartTime,
            referrer: document.referrer,
            user_agent: navigator.userAgent
        });

        // Flush events before page unload
        window.addEventListener('beforeunload', () => {
            flushEvents();
            
            // Track session end
            trackEvent('session_end', null, {
                session_duration: Date.now() - pageStartTime,
                max_scroll_depth: maxScrollDepth,
                total_clicks: clickCount,
                hesitation_loops: hesitationLoops,
                back_button_clicks: backButtonClicks
            });
        });

        isInitialized = true;
        console.log('Revenue Magick Tracker initialized successfully');
    }

    // Public API
    window.RevenueMagick = {
        init: init,
        track: trackEvent,
        identify: function(newUserId) {
            userId = newUserId;
            localStorage.setItem('rm_user_id', userId);
            // Milestone 4 MVP: Load CRM attribution data for new user
            loadCRMAttributionData();
        },
        flush: flushEvents,
        getSession: function() {
            return {
                userId: userId,
                sessionId: sessionId,
                scrollDepth: maxScrollDepth,
                timeOnPage: Date.now() - pageStartTime,
                // Milestone 4 MVP: Enhanced session data
                crmAttribution: crmAttributionData,
                processingStatus: processingStatus,
                enhancedProcessing: CONFIG.useEnhancedProcessing
            };
        },
        
        // Milestone 4 MVP: Enhanced tracking methods
        trackConversion: trackConversionEvent,
        
        // Milestone 4 MVP: Configuration management
        configure: function(newConfig) {
            Object.assign(CONFIG, newConfig);
            console.log('Revenue Magick: Configuration updated', CONFIG);
        },
        
        // Milestone 4 MVP: Data sanitization testing
        testSanitization: function(testData) {
            return sanitizeEventData(testData);
        },
        
        // Milestone 4 MVP: CRM attribution management
        getCRMAttribution: function() {
            return crmAttributionData;
        },
        
        refreshCRMAttribution: function() {
            loadCRMAttributionData();
        },
        
        // Milestone 4 MVP: Processing status
        getProcessingStatus: function() {
            return {
                status: processingStatus,
                lastChecked: Date.now(),
                enhancedProcessing: CONFIG.useEnhancedProcessing,
                autoPostConversions: CONFIG.autoPostConversions,
                sanitizePII: CONFIG.sanitizePII
            };
        },
        
        refreshProcessingStatus: function() {
            checkProcessingStatus();
        },
        
        // Milestone 4 MVP: Server-side posting control
        enableServerSidePosting: function(platforms = ['facebook', 'google'], testMode = false) {
            CONFIG.enableServerSidePosting = true;
            CONFIG.platforms = platforms;
            CONFIG.testMode = testMode;
            console.log('Revenue Magick: Server-side posting enabled', { platforms, testMode });
        },
        
        disableServerSidePosting: function() {
            CONFIG.enableServerSidePosting = false;
            console.log('Revenue Magick: Server-side posting disabled');
        },
        
        // Milestone 4 MVP: Enhanced event queue management
        getEventQueue: function() {
            return {
                queueLength: eventQueue.length,
                events: eventQueue.slice(), // Return copy
                lastFlush: flushTimer ? 'active' : 'inactive'
            };
        },
        
        clearEventQueue: function() {
            eventQueue = [];
            console.log('Revenue Magick: Event queue cleared');
        },
        
        // Milestone 4 MVP: Debug and monitoring
        getDebugInfo: function() {
            return {
                version: '1.1.0',
                initialized: isInitialized,
                userId: userId,
                sessionId: sessionId,
                config: { ...CONFIG },
                stats: {
                    scrollDepth: maxScrollDepth,
                    timeOnPage: Date.now() - pageStartTime,
                    hesitationLoops: hesitationLoops,
                    backButtonClicks: backButtonClicks,
                    eventQueueLength: eventQueue.length
                },
                milestone4Features: {
                    enhancedProcessing: CONFIG.useEnhancedProcessing,
                    datasanitization: CONFIG.sanitizePII,
                    crmIntegration: !!crmAttributionData,
                    serverSidePosting: CONFIG.enableServerSidePosting,
                    processingStatus: processingStatus
                }
            };
        }
    };

    // Auto-initialize if config is provided via data attributes
    const script = document.querySelector('script[data-rm-auto-init]');
    if (script) {
        const autoConfig = {
            apiEndpoint: script.dataset.rmApiEndpoint || CONFIG.apiEndpoint,
            // Milestone 4 MVP: Enhanced auto-init configuration
            useEnhancedProcessing: script.dataset.rmEnhancedProcessing !== 'false',
            autoPostConversions: script.dataset.rmAutoPostConversions !== 'false',
            sanitizePII: script.dataset.rmSanitizePii !== 'false',
            enableServerSidePosting: script.dataset.rmServerSidePosting === 'true',
            platforms: script.dataset.rmPlatforms ? script.dataset.rmPlatforms.split(',') : ['facebook', 'google'],
            testMode: script.dataset.rmTestMode === 'true'
        };
        init(autoConfig);
    }

})(window, document); 