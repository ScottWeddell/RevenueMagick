// Utility to set test JWT token for development
// Run this in browser console: setTestToken()

window.setTestToken = function() {
  const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDg3NzU4NzksInN1YiI6InRlc3RfdXNlciJ9.jIzGGGpYR44LHw4BaqBjrA2iyTdlz1ygASZIF0xBNLY";
  localStorage.setItem('token', testToken);
  console.log('Test JWT token set in localStorage');
  console.log('You can now test the Facebook OAuth integration');
  return testToken;
};

// Auto-set token if not present
if (!localStorage.getItem('token')) {
  window.setTestToken();
}

console.log('Test token utility loaded. Run setTestToken() to set authentication token.'); 
 
 