/**
 * Island for the "ideas" list: wraps the external `InteractiveHoverLinks` component, which needs the
 * browser for its hover effect.
 */
import { InteractiveHoverLinks, type InteractiveLink } from '@/components/external';

/** One idea as the section passes it: texts, image and the link it opens. */
export interface IdeaItem {
  title: string;
  description: string;
  image: { src: string };
  href: string;
}

/** Adapts the Ideas data to the external component's props (docs/11 §4 rule 1). */
export default function IdeasLinks({ items }: { items: IdeaItem[] }) {
  const links: InteractiveLink[] = items.map((i) => ({
    heading: i.title,
    subheading: i.description,
    imgSrc: i.image.src,
    href: i.href,
  }));
  return <InteractiveHoverLinks links={links} />;
}
