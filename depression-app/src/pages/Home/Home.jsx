import './Home.css'
import { Link } from 'react-router-dom'
import Depressed from "../../images/depressed.png"
import Therapy from "../../images/therapy-bot.png"
import HomeImage from "../../images/home_page_image.png"
import WellnessPage from '../../components/wellness/WellnessPage'
import heroVideo from '../../assets/media/wellness-hero.mp4'


const Home = () => {
  const destinations = [
    {
      image: Depressed,
      title: "Depression Detection Test",
      description: "Take the guided screening flow with recorded answers and supportive instructions.",
      cta: "Take test",
      path: "/instructions",
    },
    {
      image: Therapy,
      title: "Chatbot Therapy",
      description: "Talk through stress, low mood, anxiety, or overthinking in a calmer conversation space.",
      cta: "Chat with us",
      path: "/chat-bot",
    },
    {
      image: HomeImage,
      title: "Profile & Results",
      description: "Review your earlier outcomes and revisit your personal screening history anytime.",
      cta: "Open profile",
      path: "/profile",
    },
  ];
  
  return (
    <WellnessPage
      className="home-page"
      contentClassName="home-page__content"
      videoSrc={heroVideo}
      subtitle="Choose the support path you need right now, from guided screening to gentle conversation."
    >
      <section className="home-hero reveal-up">
        <div className="wm-panel wm-panel--hero">
          <p className="wm-eyebrow">Your wellness dashboard</p>
          <h1 className="wm-heading">Everything you need is gathered into one calmer, clearer space.</h1>
          <p className="wm-subcopy">
            Move between screening, guided support, and past results without losing your place.
            Each section is designed to stay soft, readable, and emotionally low-pressure.
          </p>
        </div>
      </section>

      <section className="wm-grid-three home-card-grid reveal-up delay-1">
        {destinations.map((card) => (
          <article key={card.title} className="wm-panel home-card">
            <div className="home-card__image-wrap">
              <img src={card.image} alt={card.title} />
            </div>
            <div className="home-card__body">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
            <Link to={card.path} className="wm-link-button wm-link-button--primary home-card__action">
              {card.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="wm-grid-two home-support-grid reveal-up delay-2">
        <div className="wm-card">
          <p className="wm-eyebrow">Gentle pacing</p>
          <h3>Take one step at a time without rushing the process.</h3>
          <p>
            If you feel unsure where to begin, start with the instructions page and move into
            the screening only when you feel settled enough to continue.
          </p>
        </div>

        <div className="wm-card">
          <p className="wm-eyebrow">Support when needed</p>
          <h3>The chatbot stays available whenever you want a softer space to reflect.</h3>
          <p>
            You can come back after a test, in the middle of a stressful day, or simply when
            you want a supportive prompt to slow things down.
          </p>
        </div>
      </section>
    </WellnessPage>
  )
}

export default Home
