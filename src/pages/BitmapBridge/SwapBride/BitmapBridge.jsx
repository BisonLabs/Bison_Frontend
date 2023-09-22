import { Link } from 'react-router-dom';
import Layout from '../../../components/Layout';
import XBox from '../../../components/XBox';

const BitmapBridgeAll = (props) => {
  const BitmapBridgeItems = props.BitmapBridgeItems;
  const handleAddSelectedBitmap = props.handleAddSelectedBitmap;
  const isLoading = props.isLoading;

  return (
    <Layout>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-5 gap-10">
        {isLoading ? (
          <div className="col-span-full text-center text-gray-500">
            Loading...
          </div>
        ) : BitmapBridgeItems.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            No Bitmap Found in this address
          </div>
        ) : (
          BitmapBridgeItems.map((item, index) => {
            return (
              <Link key={index} onClick={(e) => { e.preventDefault(); handleAddSelectedBitmap(item); }}>
                <XBox isBackground={true} square={true}>
                  <img style={{ height: "89%" }} src={item.imgURL} alt="" />
                  <p>{item.name}</p>
                </XBox>
              </Link>
            );
          })
        )}
      </div>
    </Layout>
  );
};

export default BitmapBridgeAll;
