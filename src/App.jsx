import { Analytics } from '@vercel/analytics/react';
import HomePage from "./HomePage";
import Footer from "./components/Footer";

function App() {

  return (
    <main>
      <HomePage />
      <Footer />
      <Analytics />
    </main>
  )
}

export default App;
