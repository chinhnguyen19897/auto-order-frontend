import Checkout from '../../../components/Checkout/Checkout';
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; return <Checkout token={token} />;
}
