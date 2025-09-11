import ResetPasswordClient from './ResetPasswordClient';

export async function generateStaticParams() {
  return []
}

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  return <ResetPasswordClient token={params.token} />;
}