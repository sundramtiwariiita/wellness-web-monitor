import { Link } from "react-router-dom";
import { FiActivity, FiUsers } from "react-icons/fi";
import WellnessPage from "../../components/wellness/WellnessPage";
import "./Admin.css";

const adminCards = [
  {
    title: "Users",
    description: "Review registered user profiles and contact details.",
    to: "/users-page",
    action: "See all existing users",
    icon: FiUsers,
  },
  {
    title: "Testing",
    description: "Inspect completed tests, filter by date, and export reports.",
    to: "/testing-page",
    action: "See all results",
    icon: FiActivity,
  },
];

const Admin = () => {
  return (
    <WellnessPage
      className="admin-page"
      contentClassName="admin-page__content"
      subtitle="A clean administrative view for managing Wellness Monitor records."
    >
      <section className="admin-hero wm-panel wm-panel--hero reveal-up">
        <p className="wm-eyebrow">Admin Workspace</p>
        <h1 className="wm-display">Manage wellness data with clarity.</h1>
        <p className="wm-subcopy">
          Access user records and testing results from a calmer, more readable dashboard while keeping the existing admin routes unchanged.
        </p>
      </section>

      <section className="admin-card-grid" aria-label="Admin actions">
        {adminCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <Link
              className={`admin-action-card wm-card reveal-up delay-${index + 1}`}
              key={card.title}
              to={card.to}
            >
              <span className="admin-action-card__icon" aria-hidden="true">
                <Icon />
              </span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <span className="admin-action-card__link">{card.action}</span>
            </Link>
          );
        })}
      </section>
    </WellnessPage>
  );
};

export default Admin;
