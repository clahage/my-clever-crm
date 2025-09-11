// Email listener and dispatcher for CRM email aliases
// Requires: imap-simple, mailparser, and your CRM logic module

const Imap = require('imap-simple');
const { simpleParser } = require('mailparser');
const aliasActions = require('./emailAliasActions');
const crm = require('./crmLogic'); // Placeholder for your CRM logic module

const config = {
  imap: {
    user: 'your-inbox@speedycreditrepair.com',
    password: 'YOUR_PASSWORD',
    host: 'imap.yourprovider.com',
    port: 993,
    tls: true,
    authTimeout: 3000
  }
};

Imap.connect(config).then(connection => {
  connection.openBox('INBOX').then(() => {
    setInterval(() => {
      connection.search(['UNSEEN'], { bodies: ['HEADER', 'TEXT'], markSeen: true })
        .then(messages => {
          messages.forEach(async item => {
            const all = item.parts.find(part => part.which === 'TEXT');
            const id = item.attributes.uid;
            const idHeader = "Imap-Id: " + id + "\r\n";
            const mail = await simpleParser(idHeader + all.body);
            const toAddress = (mail.to.value[0].address || '').toLowerCase();
            if (aliasActions[toAddress]) {
              await aliasActions[toAddress].handler(mail, crm);
              console.log(`Processed action for alias: ${toAddress}`);
            } else {
              console.log(`No action mapped for alias: ${toAddress}`);
            }
          });
        });
    }, 10000); // Check every 10 seconds
  });
});
