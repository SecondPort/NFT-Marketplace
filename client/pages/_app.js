import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps, }) {
  return (
    <div>
      <nav className="border-b p-6 font-family-inherit">
        <p className="text-4xl font-bold">Marketplace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-teal-400">
              Home
            </a>
          </Link>
          <Link href="/create-and-list-nft">
            <a className="mr-6 text-teal-400">
              Vender un nuevo NFT
            </a>
          </Link>
          <Link href="/my-nfts">
            <a className="mr-6 text-teal-400">
              Mis NFTs
            </a>
          </Link>
          <Link href="/my-listed-nfts">
            <a className="mr-6 text-teal-400">
              Mis NFTs listados
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
