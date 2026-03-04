import Image from 'next/image'
import Link from 'next/link'


const AppLogo = () => {
  return (
    <>
      <Link href="/" className="logo-dark">
        <Image src="/images/walter-gomero-logo.svg" alt="WG logo" width={240} height={60} className="d-block" />
      </Link>
      <Link href="/" className="logo-light">
        <Image src="/images/walter-gomero-logo-dark.svg" alt="WG logo" width={240} height={60} className="d-block" />
      </Link>
    </>
  )
}

export default AppLogo
