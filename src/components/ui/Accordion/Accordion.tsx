import { Icon } from "../Icon/Icon";
import s from "./Accordion.module.scss";

/** Native <details>: zero JS, accessible, works before hydration. */
export function Accordion({ items }: { items: { title: string; content: React.ReactNode }[] }) {
  return (
    <div className={s.accordion}>
      {items.map((item) => (
        <details key={item.title} className={s.item} name="accordion">
          <summary className={s.summary}>
            {item.title}
            <Icon name="chevronDown" size={20} className={s.chevron} />
          </summary>
          <div className={s.content}>{item.content}</div>
        </details>
      ))}
    </div>
  );
}
