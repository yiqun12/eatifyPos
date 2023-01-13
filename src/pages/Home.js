import React from 'react'
import Card from './Card'
import Category from './Category'
import Food from './Food'
import Hero from './Hero'
import Navbar from './Navbar'


const Home = () => {
  return (
    <>
      <Navbar/>
      <Hero />
      <Card />
      <Food />
      <Category />
    </>
  )
}

export default Home