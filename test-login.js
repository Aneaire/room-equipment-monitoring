// Simple test script to verify authentication
const testCredentials = [
  { username: 'admin', password: 'admin123', expectedRole: 'admin' },
  { username: 'rocampo', password: 'faculty123', expectedRole: 'faculty' },
  { username: 'labkeeper', password: 'custodian123', expectedRole: 'custodian' }
]

console.log('🧪 Testing Authentication...')
console.log('Server running on: http://localhost:3001')
console.log('')

testCredentials.forEach((cred, index) => {
  console.log(`Test ${index + 1}:`)
  console.log(`  Username: ${cred.username}`)
  console.log(`  Password: ${cred.password}`)
  console.log(`  Expected Role: ${cred.expectedRole}`)
  console.log(`  Login URL: http://localhost:3001/auth/signin`)
  console.log('')
})

console.log('📋 Manual Testing Instructions:')
console.log('1. Open http://localhost:3001 in your browser')
console.log('2. Click on "Create a new account" to test registration')
console.log('3. Use the credentials above to test login')
console.log('4. Verify that you are redirected to the correct dashboard based on your role')
console.log('5. Test the "Forgot password" functionality')
console.log('')
console.log('🔧 If login fails, check:')
console.log('- Browser console for errors')
console.log('- Network tab for failed requests')
console.log('- Database connection in .env.local')