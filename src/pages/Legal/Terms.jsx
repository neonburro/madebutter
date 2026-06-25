// src/pages/Legal/Terms.jsx
// Plain-language terms. Honest and short. Names Burroship as the operating parent.
// Not legal advice; have counsel review before heavy reliance.
import LegalLayout, { Section } from './LegalLayout';

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro="The short honest version of how ordering from madebutter works. Read it once and get back to the donuts."
      updated="June 2026"
    >
      <p>
        madebutter. is a bakery and product lab in Ridgway, Colorado. The kitchen, the rewards program and payments are operated by Burroship, our parent company. By placing an order you agree to these terms.
      </p>

      <Section heading="Ordering and pickup">
        <p>
          When you order through our site you are reserving items for pickup at our Ridgway location. Everything is made fresh in limited daily batches, so flavors come and go.
        </p>
        <p>
          Grab and Go pickup is simple. When your order is ready we send your locker number and a code to open it through the contact method you picked at checkout. Walk in, open the locker, grab your order. You can also come to the counter and say hi.
        </p>
        <p>
          If something sells out before we confirm your order we will reach out to adjust or refund that item.
        </p>
      </Section>

      <Section heading="Payment">
        <p>
          Payments are processed through Stripe. The checkout you see is our own design, but all card data is handled securely by Stripe. We never see or store your full card details.
        </p>
        <p>
          Applicable Colorado and Ridgway sales tax is added at checkout and shown before you pay.
        </p>
      </Section>

      <Section heading="Proof of payment">
        <p>
          Your receipt is the email we send the moment your payment goes through. It lists your items, your total and your order number. Keep it handy if you ever need to show proof of purchase.
        </p>
      </Section>

      <Section heading="Refunds">
        <p>
          We want every order to be right. If something goes wrong, same day refunds are welcome. Reach out the day of your order and we will make it good, whether that is a refund or a remake.
        </p>
      </Section>

      <Section heading="Burroship Rewards">
        <p>
          Rewards are coming through Burroship, our parent company. One membership will work across the family of brands Burroship operates. The program is not live yet. You can peek at what is coming at burroship.com/rewards.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          We may update these terms as the bakery grows. The latest version always lives on this page.
        </p>
      </Section>
    </LegalLayout>
  );
}
