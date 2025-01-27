import React, { useState } from 'react'
import { data, categories } from './data.js'
import { motion, AnimatePresence } from "framer-motion"
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';

const Food = () => {
  const [foods, setFoods] = useState(data);

  const filterType = (category) => {
    setFoods(
      data.filter((item) => {
        return item.category === category;
      })
    )
  }
  const filterPrice = (price) => {
    setFoods(
      data.filter((item) => {
        return item.price === price;
      })
    )
  }

  return (
    <div>

      <Carousel className="max-w-[1240px] mx-auto" showThumbs={false} width={"none"} emulateTouch={true} showArrows={false} showStatus={false} showIndicators={false} swipeable={true} autoPlay infiniteLoop>
        <div className='max-w-[1240px] mx-auto p-4 '>
          <div className='max-h-[500px] relative'>
            <div className='absolute  w-full h-full max-h-[500px] bg-black/40 text-gray-200 flex flex-col justify-center'>
              <h1 className='!px-4 text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-justify'>The <span className='text-orange-500'>Best</span></h1>
              <h1 className='!px-4 text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-justify'> <span className='text-orange-500'>Foods </span>Delivered</h1>
            </div>
            <img className='w-full max-h-[500px] object-cover' src="https://images.pexels.com/photos/1565982/pexels-photo-1565982.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="#" />
          </div>
        </div>
        <div className='max-w-[1240px] mx-auto p-4 '>
          <div className='max-h-[500px] relative'>
            <div className='absolute  w-full h-full max-h-[500px] bg-black/40 text-gray-200 flex flex-col justify-center'>
              <h1 className='px-4 text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-justify'>The <span className='text-orange-500'>Best</span></h1>
              <h1 className='px-4 text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-justify'> <span className='text-orange-500'>Foods </span>Delivered</h1>
            </div>
            <img className='w-full max-h-[500px] object-cover' src="https://images.unsplash.com/photo-1503767849114-976b67568b02?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="#" />
          </div>
        </div>
        <div className='max-w-[1240px] mx-auto p-4 '>
          <div className='max-h-[500px] relative'>
            <div className='absolute  w-full h-full max-h-[500px] bg-black/40 text-gray-200 flex flex-col justify-center'>
              <h1 className='px-4 text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-justify'>The <span className='text-orange-500'>Best</span></h1>
              <h1 className='px-4 text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-justify'> <span className='text-orange-500'>Foods </span>Delivered</h1>
            </div>
            <img className='w-full max-h-[500px] object-cover' src="https://images.unsplash.com/photo-1516685018646-549198525c1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="#" />
          </div>
        </div>
      </Carousel>
      <div className='max-w-[1240px] mx-auto p-4 py-12 grid md:grid-cols-3 gap-6'>
        <div className='rounded-xl relative hover:scale-105 duration-500 cursor-pointer'>
          <div className='absolute w-full h-full bg-black/50 rounded-xl text-white'>
            <p className=' font-bold text-2xl px-2 pt-4'>Sun's Out, BOGO's Out</p>
            <p className='px-2'>Through 8/26</p>
            <button className='border border-white bg-white text-black mx-2 rounded-xl px-5 py-1 absolute bottom-4 shadow-md'>Order Now</button>
          </div>
          <img className='max-h-[160px] md:max-h-[200px] w-full object-cover rounded-xl' src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=781&q=80" alt="" />
        </div>
        <div className='rounded-xl relative hover:scale-105 duration-500 cursor-pointer'>
          <div className='absolute w-full h-full bg-black/50 rounded-xl text-white'>
            <p className=' font-bold text-2xl px-2 pt-4'>Sun's Out, BOGO's Out</p>
            <p className='px-2'>Through 8/26</p>
            <button className='border border-white bg-white text-black mx-2 rounded-xl px-5 py-1 absolute bottom-4 shadow-md'>Order Now</button>
          </div>
          <img className='max-h-[160px] md:max-h-[200px] w-full object-cover rounded-xl' src="https://images.unsplash.com/photo-1634818462211-aa45f43dafdf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80" alt="" />
        </div>
        <div className='rounded-xl relative hover:scale-105 duration-500 cursor-pointer'>
          <div className='absolute w-full h-full bg-black/50 rounded-xl text-white'>
            <p className=' font-bold text-2xl px-2 pt-4'>Sun's Out, BOGO's Out</p>
            <p className='px-2'>Through 8/26</p>
            <button className='border border-white bg-white text-black mx-2 rounded-xl px-5 py-1 absolute bottom-4 shadow-md'>Order Now</button>
          </div>
          <img className='max-h-[160px] md:max-h-[200px] w-full object-cover rounded-xl' src="https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80" alt="" />
        </div>
      </div>

      <div className='max-w-[1240px] m-auto px-4 py-12'>

        <h1 className='text-orange-600 font-bold text-4xl text-center'>
          Top Rated Menu Items
        </h1>
        <div className='flex flex-col lg:flex-row justify-between'>
          {/* Filter Type */}
          <div>
            <p className='font-bold text-gray-700'>Filter Type</p>
            <div className='flex justify-between flex-wrap'>
              <button onClick={() => setFoods(data)} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1'>All</button>
              <button onClick={() => filterType('burger')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1'>Burgers</button>
              <button onClick={() => filterType('pizza')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1'>Pizza</button>
              <button onClick={() => filterType('salad')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1'>Salads</button>
              <button onClick={() => filterType('chicken')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1'>Chicken</button>
            </div>
          </div>

          {/* Filter Price */}
          <div>
            <p className='font-bold text-gray-700'>Filter Price</p>
            <div className='flex justify-between flex-wrap max-w-[390px] w-full'>
              <button onClick={() => filterPrice('$')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1'>$</button>
              <button onClick={() => filterPrice('$$')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1'>$$</button>
              <button onClick={() => filterPrice('$$$')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1'>$$$</button>
              <button onClick={() => filterPrice('$$$$')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1'>$$$$</button>
            </div>
          </div>
        </div>

        {/* diplay food */}
        <AnimatePresence>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4'>
            {foods.map((item, index) => (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                key={item.id}
                className="border shadow-lg rounded-lg hover:scale-105 duration-500 cursor-pointer">
                <img className='w-full h-[150px] md:h-[200px] object-cover rounded-t-lg' src={item.image} alt={item.name} />
                <div className='flex justify-between px-2 py-4'>
                  <p>{item.name}</p>
                  <p>
                    <span className='bg-orange-500 text-white p-1 rounded-md'>{item.price}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
      <div className='max-w-[1240px] mx-auto px-4 py-12'>
        <h1 className='text-orange-600 font-bold text-4xl text-center'>Top Rated Menu Items</h1>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6 py-8'>
          {categories.map((item, index) => (
            <div key={index} className='bg-gray-100 rounded-lg p-4 flex justify-between items-center shadow-md cursor-pointer hover:bg-gray-200 hover:scale-105 duration-300'>
              <h2 className='font-bold sm:text-xl'>{item.name}</h2>
              <img className='w-16' src={item.image} alt={item.name} />
            </div>
          ))}
        </div>
      </div>
    </div>

  )
}

export default Food