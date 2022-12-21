
import { motion } from 'framer-motion';
import { useEffect } from 'react';

import Banner from '~/layouts/common/Banner';
import Footer from '~/layouts/common/Footer';
import requests from '~/service/requests';





const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
  }

}

function Home() {
  useEffect(() => {
    document.title = `Home - Netflix`
  })
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <Banner fetchBannerData={requests.fetchComedyMovies} />
      <Footer/>
    </motion.div>

  )
}

export default Home;