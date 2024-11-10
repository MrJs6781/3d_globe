import React from 'react'
import dynamic from 'next/dynamic'
 
const DynamicGlobe = dynamic(() => import('./../components/GlobeComponent'), {
  ssr: false,
})

export default function page() {
  return (
    <DynamicGlobe />
  )
}
