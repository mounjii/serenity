import { getGoogleRating } from "@/lib/google-reviews";
import { GOOGLE_REVIEW_URL } from "@/lib/site";
import Testimonials from "./Testimonials";

export default async function ReviewSection() {
  const google = await getGoogleRating();
  return <Testimonials rating={google.rating} count={google.count} reviewUrl={GOOGLE_REVIEW_URL} />;
}
