// src/pages/Legal/Privacy.jsx
// Plain-language privacy policy. Honest and short. Names Burroship as operator.
// Not legal advice; have counsel review before heavy reliance.
import LegalLayout, { Section } from './LegalLayout';

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="What we collect, why we collect it and how we treat it. No surprises, no selling your data."
      updated="June 2026"
    >
      <p>
        madebutter. is operated by Burroship. This covers how we handle your information when you order from us or create an account.
      </p>

      <Section heading="What we collect">
        <p>
          When you order or make an account we collect your name, your contact method (email or phone) and your order history. If you opt in, we note that you want rewards and promotions. That is it.
        </p>
      </Section>

      <Section heading="Why we collect it">
        <p>
          We use your info to make and hand off your order, send your receipt, let you know when your order is ready and, if you opted in, share the occasional good thing. We do not sell your data to anyone.
        </p>
      </Section>

      <Section heading="Payments">
        <p>
          Card payments are processed by Stripe. We never see or store your full card number. Stripe handles that securely on its own systems.
        </p>
      </Section>

      <Section heading="Messages">
        <p>
          If you choose text or email for order updates, we use that only for your orders and, with your opt in, for promotions. You can opt out of promotions anytime and still get order updates.
        </p>
      </Section>

      <Section heading="Your account">
        <p>
          You can view your orders, update your details and change your password from your account page anytime. If you want your account removed, reach out and we will take care of it.
        </p>
      </Section>

      <Section heading="Burroship">
        <p>
          Because Burroship operates the kitchen, payments and the coming rewards program, some of your info is handled by Burroship systems to run those services. The same care applies across the family.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about your data or this policy? Reach out through the contact method on your receipt and we will help.
        </p>
      </Section>
    </LegalLayout>
  );
}
