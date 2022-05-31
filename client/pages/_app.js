import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className='border-b p-6'>
        <p className='text-4xl font-bold'>BoredStudent Marketplace</p>
        <div className='flex mt-4'>
          <Link href="/">
            <a className='mr-4 text-teal-400 '>
              Home
            </a>
          </Link>
          <Link href="/crear y listar un nft">
            <a className='mr-6 text-teal-400 '>
              Vender un nuevo NFT
            </a>
          </Link>
          <Link href="/mis nfts listado" >
            <a className='mr-6 text-teal-400'>
              Mis Nfts Listados
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
