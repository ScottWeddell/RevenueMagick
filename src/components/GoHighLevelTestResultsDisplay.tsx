import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Database, TrendingUp, Users, Target, Zap, MapPin, Calendar, Workflow } from 'lucide-react';

interface GoHighLevelTestResultsDisplayProps {
  testResults: {
    valid: boolean;
    error?: string;
    userInfo?: any;
    locationInfo?: any;
    capabilities?: string[];
    limitations?: string[];
    accessSummary?: {
      location_access?: boolean;
      contacts_access?: boolean;
      pipelines_access?: boolean;
      opportunities_access?: boolean;
      calendar_access?: boolean;
      workflows_access?: boolean;
      total_capabilities?: number;
      total_limitations?: number;
      integration_ready?: boolean;
      data_types_available?: string[];
    };
    contactsData?: {
      total_contacts?: number;
      sample_contacts?: any[];
      contact_fields?: string[];
      has_custom_fields?: boolean;
    };
    pipelinesData?: {
      total_pipelines?: number;
      total_stages?: number;
      pipeline_names?: string[];
      sample_pipeline?: any;
    };
    opportunitiesData?: {
      total_opportunities?: number;
      total_value?: number;
      sample_opportunities?: any[];
      opportunity_fields?: string[];
    };
    calendarData?: {
      teams_count?: number;
      services_count?: number;
      total_calendar_items?: number;
    };
    workflowsData?: {
      total_workflows?: number;
      workflow_types?: string[];
      sample_workflows?: any[];
    };
  };
}

const GoHighLevelTestResultsDisplay: React.FC<GoHighLevelTestResultsDisplayProps> = ({
  testResults
}) => {
  if (!testResults.valid && testResults.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <XCircle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">Connection Failed</h3>
        </div>
        <p className="text-red-700">{testResults.error}</p>
      </div>
    );
  }

  const { accessSummary, contactsData, pipelinesData, opportunitiesData, calendarData, workflowsData } = testResults;

  return (
    <div className="space-y-6">
      {/* Header Status */}
      <div className={`border rounded-lg p-6 ${testResults.valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          {testResults.valid ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {testResults.valid ? 'GoHighLevel Integration Ready!' : 'GoHighLevel Integration Partially Ready'}
          </h3>
        </div>
        
        {testResults.locationInfo && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Connected to: <span className="font-medium">{testResults.locationInfo.name || 'Unknown Location'}</span>
            </p>
            {testResults.locationInfo.address && (
              <p className="text-sm text-gray-600">
                Address: <span className="font-medium">{testResults.locationInfo.address}</span>
              </p>
            )}
          </div>
        )}

        {/* Capabilities Overview */}
        {testResults.capabilities && testResults.capabilities.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Available Capabilities:</h4>
              <div className="space-y-1">
                {testResults.capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-sm text-green-700">{capability}</span>
                  </div>
                ))}
              </div>
            </div>
            {testResults.limitations && testResults.limitations.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Limitations:</h4>
                <div className="space-y-1">
                  {testResults.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-yellow-500" />
                      <span className="text-sm text-yellow-700">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data Access Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contacts Data */}
        {contactsData && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">Contacts</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Contacts:</span>
                <span className="text-sm font-medium">{contactsData.total_contacts || 0}</span>
              </div>
              
              {contactsData.contact_fields && contactsData.contact_fields.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Available Fields:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {contactsData.contact_fields.slice(0, 6).map((field, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {field}
                      </span>
                    ))}
                    {contactsData.contact_fields.length > 6 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{contactsData.contact_fields.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {contactsData.has_custom_fields && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-700">Custom fields available</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pipelines Data */}
        {pipelinesData && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Pipelines</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Pipelines:</span>
                <span className="text-sm font-medium">{pipelinesData.total_pipelines || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Stages:</span>
                <span className="text-sm font-medium">{pipelinesData.total_stages || 0}</span>
              </div>

              {pipelinesData.pipeline_names && pipelinesData.pipeline_names.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Pipeline Names:</span>
                  <div className="mt-1 space-y-1">
                    {pipelinesData.pipeline_names.map((name, index) => (
                      <div key={index} className="text-sm text-purple-700 font-medium">
                        • {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Opportunities Data */}
        {opportunitiesData && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-semibold text-gray-900">Opportunities</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Opportunities:</span>
                <span className="text-sm font-medium">{opportunitiesData.total_opportunities || 0}</span>
              </div>
              
              {opportunitiesData.total_value !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Value:</span>
                  <span className="text-sm font-medium">${opportunitiesData.total_value.toFixed(2)}</span>
                </div>
              )}

              {opportunitiesData.opportunity_fields && opportunitiesData.opportunity_fields.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Available Fields:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {opportunitiesData.opportunity_fields.slice(0, 4).map((field, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {field}
                      </span>
                    ))}
                    {opportunitiesData.opportunity_fields.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{opportunitiesData.opportunity_fields.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendar Data */}
        {calendarData && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-orange-600" />
              <h4 className="text-lg font-semibold text-gray-900">Calendar</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Teams:</span>
                <span className="text-sm font-medium">{calendarData.teams_count || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Services:</span>
                <span className="text-sm font-medium">{calendarData.services_count || 0}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Items:</span>
                <span className="text-sm font-medium">{calendarData.total_calendar_items || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Workflows Data */}
        {workflowsData && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Workflow className="w-5 h-5 text-indigo-600" />
              <h4 className="text-lg font-semibold text-gray-900">Workflows</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Workflows:</span>
                <span className="text-sm font-medium">{workflowsData.total_workflows || 0}</span>
              </div>

              {workflowsData.workflow_types && workflowsData.workflow_types.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Trigger Types:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {workflowsData.workflow_types.map((type, index) => (
                      <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {workflowsData.sample_workflows && workflowsData.sample_workflows.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Sample Workflows:</span>
                  <div className="mt-1 space-y-1">
                    {workflowsData.sample_workflows.slice(0, 3).map((workflow, index) => (
                      <div key={index} className="text-sm text-indigo-700">
                        • {workflow.name} ({workflow.status})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Integration Summary */}
      {accessSummary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-4">Integration Summary</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Available Data Types:</h5>
              <div className="space-y-1">
                {accessSummary.data_types_available?.map((dataType, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-sm text-blue-700">{dataType}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Integration Status:</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Ready for Production:</span>
                  <span className={`text-sm font-medium ${accessSummary.integration_ready ? 'text-green-600' : 'text-yellow-600'}`}>
                    {accessSummary.integration_ready ? 'Yes' : 'Partial'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Total Capabilities:</span>
                  <span className="text-sm font-medium text-blue-800">{accessSummary.total_capabilities}</span>
                </div>
                {(accessSummary.total_limitations ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Minor Limitations:</span>
                    <span className="text-sm font-medium text-yellow-600">{accessSummary.total_limitations}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoHighLevelTestResultsDisplay; 