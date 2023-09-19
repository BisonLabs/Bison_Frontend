import { Link } from 'react-router-dom'
import Layout from '../../../components/Layout'
import XBox from '../../../components/XBox'

const BitmapBridgeAll = (props) => {
  const BitmapBridgeItems = props.BitmapBridgeItems
  const handleAddSelectedBitmap = props.handleAddSelectedBitmap

  return (
    <Layout>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-5 gap-10">

      {BitmapBridgeItems.map( (item, index) => {
        return(
          <Link key={index} onClick={(e)=>{e.preventDefault(); handleAddSelectedBitmap(item)}}>
            <XBox isBackground={true} square={true}>
              <img style={{height: "89%"}} src={item.imgURL} alt="" />
              <p>{item.name}</p>
            </XBox>
          </Link>
        )
      } )}
      </div>
    </Layout>
  )
}

export default BitmapBridgeAll