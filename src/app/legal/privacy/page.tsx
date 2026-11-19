import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Privacy Policy — Deal or Steal" };

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="18 November 2026"
      sections={[
        {
          h: "Who we are",
          p: ["Deal or Steal is a prototype AI property service for the Dubai market. This policy explains what personal data we collect and how we use it, in line with the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021)."],
        },
        {
          h: "What we collect",
          p: [
            "You can browse properties, use the price check and chat with the agent without an account. If you create one, we collect:",
            [
              "Account data: your name, email address and, if you choose to give it, your phone number. If you sign in with Google, we receive your name, email and profile picture from Google.",
              "Your password, stored only as a one-way bcrypt hash. We never store or see your password in plain text.",
              "Saved homes: the properties you add to your shortlist.",
              "Viewing requests: the property, the time slot you picked and any note you add.",
              "Offers: the property, the amount you offer and any message to the seller.",
            ],
            "We also collect:",
            [
              "Search and chat content: what you ask the agent and the filters you use.",
              "Technical data: device, browser and approximate usage analytics.",
            ],
          ],
        },
        {
          h: "How we use it",
          p: [[
            "To answer your questions and show relevant properties.",
            "To run your account: sign you in, and keep your saved homes, viewings and offers in one place.",
            "To pass viewing requests and offers (with your name and contact details) to the listing agent or owner you selected.",
            "To improve the accuracy of our models and the product.",
          ], "We do not sell your personal data."],
        },
        {
          h: "AI processing",
          p: ["Chat messages may be processed by a third-party AI model provider to generate replies. We send only what is needed to answer you and do not permit providers to use your data to train their models."],
        },
        {
          h: "Retention",
          p: ["Chat history is kept for up to 12 months. Account data, saved homes, viewings and offers are kept while your account is open, and viewing and offer records for as long as needed to meet legal obligations. You can ask us to delete your account and its data at any time."],
        },
        {
          h: "Your rights",
          p: ["You can request access to, correction of, or deletion of your personal data, and object to certain processing. Email privacy@dealorsteal.ae."],
        },
        {
          h: "Security",
          p: ["Passwords are hashed with bcrypt before they are stored. Sessions use a signed, encrypted cookie, and every action that changes your data (saving a home, booking a viewing, making an offer, editing your profile) is checked against your session on our server."],
        },
        {
          h: "Cookies",
          p: ["We use essential cookies to keep the site working, including a session cookie that keeps you signed in, and optional analytics cookies, which you can decline."],
        },
      ]}
    />
  );
}
