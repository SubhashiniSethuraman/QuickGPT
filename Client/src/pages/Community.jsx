import React, { useEffect, useState } from 'react'
import { dummyPublishedImages } from '../assets/assets'
import Loading from './Loading'

const Community = () => {

  const [images, setImages] = useState([])
  const [loading, setLoading] =useState(true)

  const fetchImages = async () => {
    setImages(dummyPublishedImages)
    setLoading(false)
  }

  useEffect(() => {
    fetchImages()
  },[])

  if(loading)
    return <Loading/>

  return (
    <div className='p-6 pt-12 xl:px-12 2xl:px-20 w-full mx-auto h-full overflow-y-scroll'>
      <h2 className='text-xl font-semibold mb-6 text-gray-800 dark:text-purple-100'>Community Images</h2>

      {/* when item, index is used and when item alone is used in map function? 
          Three parameters for map() -> item, index, array
          Use item → 90% of cases
          Use index → only when you really need position
          
          why we needed index here?(item, index) => <a key={index}.../>
          you don’t actually “need” index here — it’s only being used as a fallback for the key.
          It works… but not ideal.
          Using index as key can cause issues if your list changes, like:
          items added
          items removed
          items reordered
          
          If your images data has something unique, use that instead:
          When is index OK?
          In your case, it's probably fine IF:
          images list is static
          no reordering
          no deletion/insertion in between
          
          what is the purpose of key here?
          The key helps React identify which items changed, added, or removed in a list.
          
          key={item.id}        ✅ best
          key={item.imageUrl}  ✅ okay (if unique)
          key={index}          ⚠️ last option*/}

      {images.length>0 ? (
        <div className='flex flex-wrap max-sm:justify-center gap-5'>
          {images.map((item) => (
            <a key={item.imageUrl} href={item.imageUrl} target='_blank' className='relative group block rounded-lg overflow-hidden border border-gray-200
            dark:border-purple-700 shadow-sm hover:shadow-md transition-shadow duration-300'>
              <img src={item.imageUrl} alt="" className='w-full h-40 md:h-50 2xl:h-62 object-cover group-hover:scale-105
              transition-transform duration-300 ease-in-out'/>
              <p className='absolute bottom-0 right-0 text-xs bg-black/50 backdrop-blur text-white
              px-4 py-1 rounded-tl-xl opacity-0 group-hover:opacity-100 transition duration-300'>Created by {item.userName}</p>
            </a>
          ))}
        </div>
      ) : (
        <p className='text-center text-gray-600 dark:text-purple-200 mt-10'>No images available</p>
      )}
    </div>
  )
}

export default Community