// Mock Email Service for developer console logging

export const sendEmail = async ({ to, subject, html }) => {
  console.log('==================================================');
  console.log(`MOCK EMAIL SENT TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log('--------------------------------------------------');
  // Strip simple HTML tags for clean console display
  const plainText = html.replace(/<[^>]*>/g, '').trim();
  console.log(plainText);
  console.log('==================================================');
  return { success: true, messageId: 'mock-msg-' + Date.now() };
};
