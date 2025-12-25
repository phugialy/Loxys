import crypto from 'crypto';

/**
 * Verify Twilio webhook signature
 */
export function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string,
  authToken: string
): boolean {
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      return acc + key + params[key];
    }, url);

  const computed = crypto
    .createHmac('sha1', authToken)
    .update(data, 'utf-8')
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computed)
  );
}

/**
 * Verify Postmark webhook signature
 */
export function verifyPostmarkSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf-8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computed)
  );
}

/**
 * Verify SendGrid webhook signature
 */
export function verifySendGridSignature(
  body: string,
  signature: string,
  timestamp: string,
  publicKey: string
): boolean {
  // SendGrid uses ECDSA
  const payload = timestamp + body;
  const verifier = crypto.createVerify('sha256');
  verifier.update(payload);
  return verifier.verify(publicKey, signature, 'base64');
}

