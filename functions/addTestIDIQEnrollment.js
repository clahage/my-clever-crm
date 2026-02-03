// ============================================================================
// ADD TEST IDIQ ENROLLMENT - One-time script
// ============================================================================
// Run this from your functions directory:
//   node addTestIDIQEnrollment.js
//
// This creates a test IDIQ enrollment for Mark Russell using Jordan's
// credit report data so you can test the Dispute Population feature.
// ============================================================================

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses default credentials from gcloud or service account)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ============================================================================
// JORDAN'S CREDIT REPORT DATA (from PDF uploaded 01/24/2025)
// ============================================================================
const JORDAN_CREDIT_DATA = {
  personal: {
    name: 'JORDAN C LAHAGE',
    dob: '9/24/1997',
    address: '6891 STEEPLECHASE CIR, HUNTINGTON BEACH, CA 92648'
  },
  scores: {
    transunion: 659,
    experian: 617,
    equifax: 623
  },
  summary: {
    transunion: { total: 12, open: 5, closed: 7, delinquent: 1, derogatory: 5, collection: 2, balance: 1559 },
    experian: { total: 13, open: 3, closed: 10, delinquent: 1, derogatory: 5, collection: 2, balance: 1559 },
    equifax: { total: 11, open: 4, closed: 7, delinquent: 1, derogatory: 4, collection: 0, balance: 1067 }
  }
};

// ============================================================================
// MOCK HTML CREDIT REPORT (matches IDIQ format for parsing)
// ============================================================================
const MOCK_IDIQ_HTML = `
<!DOCTYPE html>
<html>
<head><title>Credit Report - IdentityIQ</title></head>
<body>
<div class="credit-report">
  <h1>Three Bureau Credit Report</h1>
  <p>Reference #: M60701657-TEST</p>
  <p>Report Date: 01/24/2025</p>

  <!-- Personal Information -->
  <div class="personal-info">
    <h2>Personal Information</h2>
    <table>
      <tr><td>Name:</td><td>JORDAN C LAHAGE</td></tr>
      <tr><td>Date of Birth:</td><td>9/24/1997</td></tr>
      <tr><td>Current Address:</td><td>6891 STEEPLECHASE CIR, HUNTINGTON BEACH, CA 92648</td></tr>
    </table>
  </div>

  <!-- Credit Scores -->
  <div class="credit-scores" id="credit-score">
    <h2>Credit Score</h2>
    <table>
      <tr>
        <th>Bureau</th>
        <th>Score</th>
        <th>Rating</th>
      </tr>
      <tr>
        <td>TransUnion</td>
        <td class="score">659</td>
        <td>Fair</td>
      </tr>
      <tr>
        <td>Experian</td>
        <td class="score">617</td>
        <td>Fair</td>
      </tr>
      <tr>
        <td>Equifax</td>
        <td class="score">623</td>
        <td>Fair</td>
      </tr>
    </table>
  </div>

  <!-- Account History -->
  <div class="account-history" id="account-history">
    <h2>Account History</h2>

    <!-- NEGATIVE ITEM 1: SELF/SSTATBK - Charge-Off -->
    <div class="tradeline" data-account="SELF/SSTATBK">
      <h3>SELF/SSTATBK</h3>
      <table>
        <tr><td>Account #:</td><td>D0000000036151****</td></tr>
        <tr><td>Account Type:</td><td>Revolving</td></tr>
        <tr><td>Account Type - Detail:</td><td>Secured credit card</td></tr>
        <tr><td>Bureau Code:</td><td>Individual</td></tr>
        <tr><td>Account Status:</td><td>Derogatory</td></tr>
        <tr><td>Date Opened:</td><td>02/17/2022</td></tr>
        <tr><td>Balance:</td><td>$137.00</td></tr>
        <tr><td>Credit Limit:</td><td>$175.00</td></tr>
        <tr><td>Past Due:</td><td>$137.00</td></tr>
        <tr><td>Payment Status:</td><td>Collection/Chargeoff</td></tr>
        <tr><td>Last Reported:</td><td>07/09/2024</td></tr>
        <tr><td>Comments:</td><td>Charged off as bad debt. Profit and loss write-off</td></tr>
      </table>
      <div class="bureau-reporting">
        <span class="bureau" data-bureau="TUC">TransUnion</span>
        <span class="bureau" data-bureau="EXP">Experian</span>
        <span class="bureau" data-bureau="EQF">Equifax</span>
      </div>
    </div>

    <!-- NEGATIVE ITEM 2: FST PREMIER - Charge-Off -->
    <div class="tradeline" data-account="FST PREMIER">
      <h3>FST PREMIER</h3>
      <table>
        <tr><td>Account #:</td><td>517800691447****</td></tr>
        <tr><td>Account Type:</td><td>Revolving</td></tr>
        <tr><td>Account Type - Detail:</td><td>Credit Card</td></tr>
        <tr><td>Bureau Code:</td><td>Individual</td></tr>
        <tr><td>Account Status:</td><td>Derogatory</td></tr>
        <tr><td>Date Opened:</td><td>08/22/2021</td></tr>
        <tr><td>Balance:</td><td>$515.00</td></tr>
        <tr><td>Credit Limit:</td><td>$300.00</td></tr>
        <tr><td>Past Due:</td><td>$515.00</td></tr>
        <tr><td>Payment Status:</td><td>Collection/Chargeoff</td></tr>
        <tr><td>Last Reported:</td><td>01/05/2025</td></tr>
        <tr><td>Comments:</td><td>Charged off as bad debt. Canceled by credit grantor</td></tr>
      </table>
      <div class="bureau-reporting">
        <span class="bureau" data-bureau="TUC">TransUnion</span>
        <span class="bureau" data-bureau="EXP">Experian</span>
        <span class="bureau" data-bureau="EQF">Equifax</span>
      </div>
    </div>

    <!-- NEGATIVE ITEM 3: OPENSKY CBNK - Charge-Off -->
    <div class="tradeline" data-account="OPENSKY CBNK">
      <h3>OPENSKY CBNK</h3>
      <table>
        <tr><td>Account #:</td><td>462192100440****</td></tr>
        <tr><td>Account Type:</td><td>Revolving</td></tr>
        <tr><td>Account Type - Detail:</td><td>Credit Card</td></tr>
        <tr><td>Bureau Code:</td><td>Individual</td></tr>
        <tr><td>Account Status:</td><td>Derogatory</td></tr>
        <tr><td>Date Opened:</td><td>03/23/2020</td></tr>
        <tr><td>Balance:</td><td>$157.00</td></tr>
        <tr><td>Credit Limit:</td><td>$200.00</td></tr>
        <tr><td>Past Due:</td><td>$157.00</td></tr>
        <tr><td>Payment Status:</td><td>Collection/Chargeoff</td></tr>
        <tr><td>Last Reported:</td><td>01/01/2025</td></tr>
        <tr><td>Comments:</td><td>Charged off as bad debt. Profit and loss write-off</td></tr>
      </table>
      <div class="bureau-reporting">
        <span class="bureau" data-bureau="TUC">TransUnion</span>
        <span class="bureau" data-bureau="EXP">Experian</span>
        <span class="bureau" data-bureau="EQF">Equifax</span>
      </div>
    </div>

    <!-- NEGATIVE ITEM 4: FIDELITY CRD - Collection -->
    <div class="tradeline" data-account="FIDELITY CRD">
      <h3>FIDELITY CRD</h3>
      <p class="original-creditor">Original Creditor: BEAR VALLEY ELECTRIC</p>
      <table>
        <tr><td>Account #:</td><td>F600SUH806152****</td></tr>
        <tr><td>Account Type:</td><td>Collection</td></tr>
        <tr><td>Account Type - Detail:</td><td>Collection</td></tr>
        <tr><td>Bureau Code:</td><td>Individual</td></tr>
        <tr><td>Account Status:</td><td>Derogatory</td></tr>
        <tr><td>Date Opened:</td><td>05/03/2021</td></tr>
        <tr><td>Balance:</td><td>$492.00</td></tr>
        <tr><td>High Credit:</td><td>$354.00</td></tr>
        <tr><td>Payment Status:</td><td>Collection/Chargeoff</td></tr>
        <tr><td>Last Reported:</td><td>01/09/2025</td></tr>
        <tr><td>Comments:</td><td>Placed for collection</td></tr>
      </table>
      <div class="bureau-reporting">
        <span class="bureau" data-bureau="TUC">TransUnion</span>
        <span class="bureau" data-bureau="EXP">Experian</span>
      </div>
    </div>

    <!-- NEGATIVE ITEM 5: PORTFOLIO RC - Collection -->
    <div class="tradeline" data-account="PORTFOLIO RC">
      <h3>PORTFOLIO RC</h3>
      <p class="original-creditor">Original Creditor: CAPITAL ONE N A</p>
      <table>
        <tr><td>Account #:</td><td>517805751691****</td></tr>
        <tr><td>Account Type:</td><td>Collection</td></tr>
        <tr><td>Account Type - Detail:</td><td>Collection</td></tr>
        <tr><td>Bureau Code:</td><td>Individual</td></tr>
        <tr><td>Account Status:</td><td>Derogatory</td></tr>
        <tr><td>Date Opened:</td><td>11/28/2023</td></tr>
        <tr><td>Balance:</td><td>$258.00</td></tr>
        <tr><td>High Credit:</td><td>$258.00</td></tr>
        <tr><td>Payment Status:</td><td>Collection/Chargeoff</td></tr>
        <tr><td>Last Reported:</td><td>01/21/2025</td></tr>
        <tr><td>Comments:</td><td>Placed for collection</td></tr>
      </table>
      <div class="bureau-reporting">
        <span class="bureau" data-bureau="TUC">TransUnion</span>
        <span class="bureau" data-bureau="EXP">Experian</span>
      </div>
    </div>

    <!-- NEGATIVE ITEM 6: PORTFOLIO (Equifax only) - Collection -->
    <div class="tradeline" data-account="PORTFOLIO">
      <h3>PORTFOLIO</h3>
      <table>
        <tr><td>Account #:</td><td>CAPIT-7805751691****</td></tr>
        <tr><td>Account Type:</td><td>Open Account</td></tr>
        <tr><td>Account Type - Detail:</td><td>Collection</td></tr>
        <tr><td>Bureau Code:</td><td>Individual</td></tr>
        <tr><td>Account Status:</td><td>Derogatory</td></tr>
        <tr><td>Date Opened:</td><td>11/01/2023</td></tr>
        <tr><td>Balance:</td><td>$258.00</td></tr>
        <tr><td>High Credit:</td><td>$258.00</td></tr>
        <tr><td>Past Due:</td><td>$258.00</td></tr>
        <tr><td>Payment Status:</td><td>Late 120 Days</td></tr>
        <tr><td>Last Reported:</td><td>01/01/2025</td></tr>
        <tr><td>Comments:</td><td>Collection account</td></tr>
      </table>
      <div class="bureau-reporting">
        <span class="bureau" data-bureau="EQF">Equifax</span>
      </div>
    </div>

    <!-- NEGATIVE ITEM 7: SELF/LEAD - Late 60 Days (Closed/Paid) -->
    <div class="tradeline" data-account="SELF/LEAD">
      <h3>SELF / LEAD</h3>
      <table>
        <tr><td>Account #:</td><td>1225****</td></tr>
        <tr><td>Account Type:</td><td>Installment</td></tr>
        <tr><td>Account Type - Detail:</td><td>Secured loan</td></tr>
        <tr><td>Bureau Code:</td><td>Individual</td></tr>
        <tr><td>Account Status:</td><td>Closed</td></tr>
        <tr><td>Date Opened:</td><td>03/18/2020</td></tr>
        <tr><td>Balance:</td><td>$0.00</td></tr>
        <tr><td>High Credit:</td><td>$520.00</td></tr>
        <tr><td>Payment Status:</td><td>Late 60 Days</td></tr>
        <tr><td>Last Reported:</td><td>11/07/2020</td></tr>
        <tr><td>Comments:</td><td>Closed or paid account/zero balance</td></tr>
      </table>
      <div class="bureau-reporting">
        <span class="bureau" data-bureau="TUC">TransUnion</span>
        <span class="bureau" data-bureau="EXP">Experian</span>
        <span class="bureau" data-bureau="EQF">Equifax</span>
      </div>
    </div>

    <!-- NEGATIVE ITEM 8: ATLCAPBKSELF - Late 60 Days (Closed/Paid) -->
    <div class="tradeline" data-account="ATLCAPBKSELF">
      <h3>ATLCAPBKSELF</h3>
      <table>
        <tr><td>Account #:</td><td>1835****</td></tr>
        <tr><td>Account Type:</td><td>Installment</td></tr>
        <tr><td>Account Type - Detail:</td><td>Secured loan</td></tr>
        <tr><td>Bureau Code:</td><td>Individual</td></tr>
        <tr><td>Account Status:</td><td>Closed</td></tr>
        <tr><td>Date Opened:</td><td>03/09/2021</td></tr>
        <tr><td>Balance:</td><td>$0.00</td></tr>
        <tr><td>High Credit:</td><td>$520.00</td></tr>
        <tr><td>Payment Status:</td><td>Current</td></tr>
        <tr><td>Last Reported:</td><td>05/01/2022</td></tr>
        <tr><td>Comments:</td><td>Closed or paid account/zero balance</td></tr>
      </table>
      <div class="bureau-reporting">
        <span class="bureau" data-bureau="TUC">TransUnion</span>
        <span class="bureau" data-bureau="EXP">Experian</span>
        <span class="bureau" data-bureau="EQF">Equifax</span>
      </div>
      <div class="payment-history">
        <p>Two-Year Payment History: 60, 30, OK, OK, 30, OK, OK, OK, OK, OK, OK, OK, OK</p>
      </div>
    </div>

    <!-- NEGATIVE ITEM 9: CAPITAL ONE - Late 90 Days (Closed/Paid) -->
    <div class="tradeline" data-account="CAPITAL ONE">
      <h3>CAPITAL ONE</h3>
      <table>
        <tr><td>Account #:</td><td>517805911569****</td></tr>
        <tr><td>Account Type:</td><td>Revolving</td></tr>
        <tr><td>Account Type - Detail:</td><td>Credit Card</td></tr>
        <tr><td>Bureau Code:</td><td>Individual</td></tr>
        <tr><td>Account Status:</td><td>Paid</td></tr>
        <tr><td>Date Opened:</td><td>03/26/2020</td></tr>
        <tr><td>Balance:</td><td>$0.00</td></tr>
        <tr><td>High Credit:</td><td>$146.00</td></tr>
        <tr><td>Credit Limit:</td><td>$200.00</td></tr>
        <tr><td>Payment Status:</td><td>Current</td></tr>
        <tr><td>Last Reported:</td><td>01/16/2021</td></tr>
        <tr><td>Comments:</td><td>Canceled by credit grantor</td></tr>
      </table>
      <div class="bureau-reporting">
        <span class="bureau" data-bureau="TUC">TransUnion</span>
        <span class="bureau" data-bureau="EXP">Experian</span>
        <span class="bureau" data-bureau="EQF">Equifax</span>
      </div>
      <div class="payment-history">
        <p>Two-Year Payment History: OK, 90, 60, 30, OK, OK, OK, OK, OK</p>
      </div>
    </div>

    <!-- POSITIVE ACCOUNTS -->
    
    <!-- BRCLYSBANKDE - Authorized User, Good Standing -->
    <div class="tradeline" data-account="BRCLYSBANKDE">
      <h3>BRCLYSBANKDE</h3>
      <table>
        <tr><td>Account #:</td><td>00027347739****</td></tr>
        <tr><td>Account Type:</td><td>Revolving</td></tr>
        <tr><td>Account Type - Detail:</td><td>Flexible spending credit card</td></tr>
        <tr><td>Bureau Code:</td><td>Authorized User</td></tr>
        <tr><td>Account Status:</td><td>Open</td></tr>
        <tr><td>Date Opened:</td><td>09/19/2016</td></tr>
        <tr><td>Balance:</td><td>$0.00</td></tr>
        <tr><td>Credit Limit:</td><td>$33,000.00</td></tr>
        <tr><td>Payment Status:</td><td>Current</td></tr>
        <tr><td>Last Reported:</td><td>01/06/2025</td></tr>
      </table>
      <div class="bureau-reporting">
        <span class="bureau" data-bureau="TUC">TransUnion</span>
        <span class="bureau" data-bureau="EXP">Experian</span>
        <span class="bureau" data-bureau="EQF">Equifax</span>
      </div>
    </div>

    <!-- KIKOFF - Good Standing -->
    <div class="tradeline" data-account="KIKOFF">
      <h3>KIKOFF</h3>
      <table>
        <tr><td>Account #:</td><td>CLSJHL****</td></tr>
        <tr><td>Account Type:</td><td>Revolving</td></tr>
        <tr><td>Account Type - Detail:</td><td>Charge account</td></tr>
        <tr><td>Bureau Code:</td><td>Individual</td></tr>
        <tr><td>Account Status:</td><td>Open</td></tr>
        <tr><td>Date Opened:</td><td>05/16/2021</td></tr>
        <tr><td>Balance:</td><td>$0.00</td></tr>
        <tr><td>Credit Limit:</td><td>$500.00</td></tr>
        <tr><td>Payment Status:</td><td>Current</td></tr>
        <tr><td>Last Reported:</td><td>12/31/2024</td></tr>
      </table>
      <div class="bureau-reporting">
        <span class="bureau" data-bureau="TUC">TransUnion</span>
        <span class="bureau" data-bureau="EXP">Experian</span>
        <span class="bureau" data-bureau="EQF">Equifax</span>
      </div>
    </div>

    <!-- CHIME-STRIDE - Good Standing -->
    <div class="tradeline" data-account="CHIME-STRIDE">
      <h3>CHIME-STRIDE</h3>
      <table>
        <tr><td>Account #:</td><td>23710177****</td></tr>
        <tr><td>Account Type:</td><td>Open Account</td></tr>
        <tr><td>Account Type - Detail:</td><td>Secured credit card</td></tr>
        <tr><td>Bureau Code:</td><td>Individual</td></tr>
        <tr><td>Account Status:</td><td>Open</td></tr>
        <tr><td>Date Opened:</td><td>03/19/2020</td></tr>
        <tr><td>Balance:</td><td>$0.00</td></tr>
        <tr><td>High Credit:</td><td>$2,263.00</td></tr>
        <tr><td>Payment Status:</td><td>Current</td></tr>
        <tr><td>Last Reported:</td><td>01/03/2025</td></tr>
      </table>
      <div class="bureau-reporting">
        <span class="bureau" data-bureau="TUC">TransUnion</span>
        <span class="bureau" data-bureau="EXP">Experian</span>
        <span class="bureau" data-bureau="EQF">Equifax</span>
      </div>
    </div>

    <!-- WESTLAKE FIN - Paid Auto Loan -->
    <div class="tradeline" data-account="WESTLAKE FIN">
      <h3>WESTLAKE FIN</h3>
      <table>
        <tr><td>Account #:</td><td>1306****</td></tr>
        <tr><td>Account Type:</td><td>Installment</td></tr>
        <tr><td>Account Type - Detail:</td><td>Auto Loan</td></tr>
        <tr><td>Bureau Code:</td><td>Individual</td></tr>
        <tr><td>Account Status:</td><td>Closed</td></tr>
        <tr><td>Date Opened:</td><td>02/28/2020</td></tr>
        <tr><td>Balance:</td><td>$0.00</td></tr>
        <tr><td>High Credit:</td><td>$12,109.00</td></tr>
        <tr><td>Payment Status:</td><td>Current</td></tr>
        <tr><td>Last Reported:</td><td>01/11/2021</td></tr>
        <tr><td>Comments:</td><td>Closed or paid account/zero balance</td></tr>
      </table>
      <div class="bureau-reporting">
        <span class="bureau" data-bureau="TUC">TransUnion</span>
        <span class="bureau" data-bureau="EXP">Experian</span>
        <span class="bureau" data-bureau="EQF">Equifax</span>
      </div>
    </div>

  </div>

  <!-- Inquiries -->
  <div class="inquiries" id="inquiries">
    <h2>Inquiries</h2>
    <p>None Reported</p>
  </div>

  <!-- Public Records -->
  <div class="public-records" id="public-records">
    <h2>Public Information</h2>
    <p>None Reported</p>
  </div>

  <!-- Creditor Contacts -->
  <div class="creditor-contacts" id="creditor-contacts">
    <h2>Creditor Contacts</h2>
    <table>
      <tr><td>FIDELITY CREDITORS SVC</td><td>216 SOUTH LOUISE ST, GLENDALE, CA 91205</td><td>(800) 440-1981</td></tr>
      <tr><td>PORTFOLIO RECOVERY</td><td>120 CORPORATE BOULEVARD SUITE 100, NORFOLK, VA 23502</td><td>(844) 675-3407</td></tr>
      <tr><td>FIRST PREMIER BANK</td><td>3820 N LOUISE AVE, SIOUX FALLS, SD 57107</td><td>(800) 987-5521</td></tr>
      <tr><td>SELF/SOUTH STATE BANK</td><td>515 CONGRESS AVE, AUSTIN, TX 78701</td><td>(877) 883-0999</td></tr>
      <tr><td>OPENSKY CAPITAL BANK NA</td><td>PO BOX 8130, RESTON, VA 20195</td><td>(800) 859-6412</td></tr>
      <tr><td>CAPITAL ONE</td><td>PO BOX 31293, SALT LAKE CITY, UT 84131</td><td>(800) 955-7070</td></tr>
    </table>
  </div>

</div>
</body>
</html>
`;

// ============================================================================
// MAIN FUNCTION - Add Test Enrollment
// ============================================================================
async function addTestEnrollment() {
  const CONTACT_ID = '20JlaX9NVp2G9Y5SasGn'; // Mark Russell's contact ID
  
  console.log('🚀 Adding test IDIQ enrollment for Mark Russell...');
  console.log(`   Contact ID: ${CONTACT_ID}`);
  
  try {
    // Check if enrollment already exists
    const existingQuery = await db.collection('idiqEnrollments')
      .where('contactId', '==', CONTACT_ID)
      .limit(1)
      .get();
    
    if (!existingQuery.empty) {
      console.log('⚠️  Enrollment already exists for this contact!');
      console.log('   Document ID:', existingQuery.docs[0].id);
      
      // Ask to update
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      return new Promise((resolve) => {
        rl.question('   Do you want to update it? (y/n): ', async (answer) => {
          rl.close();
          if (answer.toLowerCase() === 'y') {
            await existingQuery.docs[0].ref.update({
              reportHtml: MOCK_IDIQ_HTML,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              testData: true,
              testSource: 'Jordan Lahage Credit Report 01/24/2025'
            });
            console.log('✅ Enrollment updated successfully!');
          } else {
            console.log('❌ Cancelled.');
          }
          resolve();
        });
      });
    }
    
    // Create new enrollment
    const enrollmentData = {
      contactId: CONTACT_ID,
      contactName: 'Mark Russell', // Using Mark Russell as test contact
      status: 'active',
      planCode: 'TEST',
      reportHtml: MOCK_IDIQ_HTML,
      creditScores: {
        transunion: 659,
        experian: 617,
        equifax: 623
      },
      enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      testData: true,
      testSource: 'Jordan Lahage Credit Report 01/24/2025',
      reportDate: '2025-01-24',
      referenceNumber: 'M60701657-TEST'
    };
    
    const docRef = await db.collection('idiqEnrollments').add(enrollmentData);
    
    console.log('✅ Test enrollment created successfully!');
    console.log(`   Document ID: ${docRef.id}`);
    console.log(`   Contact ID: ${CONTACT_ID}`);
    console.log('');
    console.log('📊 Credit Report Summary:');
    console.log('   TransUnion: 659 (Fair)');
    console.log('   Experian:   617 (Fair)');
    console.log('   Equifax:    623 (Fair)');
    console.log('');
    console.log('🔴 Negative Items Included:');
    console.log('   1. SELF/SSTATBK - Charge-Off ($137)');
    console.log('   2. FST PREMIER - Charge-Off ($515)');
    console.log('   3. OPENSKY CBNK - Charge-Off ($157)');
    console.log('   4. FIDELITY CRD - Collection ($492)');
    console.log('   5. PORTFOLIO RC - Collection ($258)');
    console.log('   6. PORTFOLIO - Collection ($258) [Equifax only]');
    console.log('   7. SELF/LEAD - Late 60 Days (Paid)');
    console.log('   8. ATLCAPBKSELF - Late History (Paid)');
    console.log('   9. CAPITAL ONE - Late 90 Days (Paid)');
    console.log('');
    console.log('🧪 Now test at: https://myclevercrm.com/dispute-hub');
    console.log('   1. Click the ⚡ SpeedDial button');
    console.log('   2. Click "Scan Credit Report"');
    console.log('   3. Enter Contact ID: 20JlaX9NVp2G9Y5SasGn');
    console.log('   4. Click "Scan & Populate"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
addTestEnrollment().then(() => {
  console.log('\n✅ Script completed.');
  process.exit(0);
}).catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});