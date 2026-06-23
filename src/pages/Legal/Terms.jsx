// src/pages/Legal/Terms.jsx
// Plain-language terms of service. Starter template, not legal advice.
import LegalLayout, { Section } from './LegalLayout';

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" updated="June 2026">
      <p>
        These terms cover your use of madebutter. and our order-ahead service. By placing an order
        you agree to them. We keep this short and honest.
      </p>

      <Section heading="Ordering and pickup">
        <p>
          When you order through our site you are reserving items for pickup at our Ridgway location.
          We prepare orders fresh. We will let you know when your order is ready through the contact
          method you choose at checkout.
        </p>
        <p>
          Items are made in limited daily quantities. If something sells out before your order is
          confirmed we will contact you to adjust or refund that item.
        </p>
      </Section>

      <Section heading="Payment">
        <p>
          Payment is collected at checkout through our payment processor. Prices shown include tax.
          We do not store your full card details. Payment information is handled securely by our
          processor.
        </p>
      </Section>

      <Section heading="Pickup and freshness">
        <p>
          Our products are best enjoyed the day they are made. Please pick up your order during our
          open hours on the day you order. We are not able to hold fresh items indefinitely.
        </p>
      </Section>

      <Section heading="Refunds">
        <p>
          If we cannot fulfill part of your order, or something is wrong with what you received,
          reach out and we will make it right with a refund or replacement. Because our products are
          fresh food, we handle refunds case by case rather than through a blanket policy.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          We may update these terms as madebutter. grows. The current version always lives on this
          page with its last updated date.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about these terms? Reach us through the contact options on our site. We are based
          in Ridgway, Colorado.
        </p>
      </Section>
    </LegalLayout>
  );
}
