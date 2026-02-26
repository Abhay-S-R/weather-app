import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-bottom">
        <p>&copy; {currentYear} Havāmāna. All rights reserved.</p>
        <p>Weather data powered by OpenWeather API</p>
        <p>Made with 💖 by Abhay</p>
      </div>
    </footer>
  );
}
