// src/pages/Legal/Privacy.jsx
// Plain-language privacy policy. Starter template, not legal advice.
import LegalLayout, { Section } from './LegalLayout';

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 2026">
      <p>
        This explains what we collect, why, and what we do with it. We collect as little as we can
        and we do not sell your information.
      </p>

      <Section heading="What we collect">
        <p>
          When you place an order we collect your name, your chosen contact method (a phone number or
          email address), and your order details. Our payment processor collects your payment
          information directly and securely. We never see or store your full card number.
        </p>
      </Section>

      <Section heading="Why we collect it">
        <p>
          We use your contact information to send you updates about your order, like letting you know
          when it is ready for pickup. If you opt in, we save your details so checkout is faster next
          time and so you can take part in rewards.
        </p>
      </Section>

      <Section heading="Messages">
        <p>
          If you choose text or email updates, we only message you about your orders. We will not send
          you marketing messages unless you separately opt into them. You can ask us to stop messaging
          you at any time.
        </p>
      </Section>

      <Section heading="What we do not do">
        <p>
          We do not sell your personal information. We do not share it with anyone except the services
          we need to run our business, like our payment processor and the tools that send your order
          notifications.
        </p>
      </Section>

      <Section heading="Saving your info">
        <p>
          Saving your information for rewards and faster checkout is optional and off by default. If
          you opt in, you can ask us to delete your saved information at any time.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Want to know what we have, or want it deleted? Reach us through the contact options on our
          site. We are based in Ridgway, Colorado.
        </p>
      </Section>
    </LegalLayout>
  );
}
