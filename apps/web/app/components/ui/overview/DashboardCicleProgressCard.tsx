import { Badge } from "@/components/Badge";
import { ProgressCircle } from "@/components/ProgressCircle";

export type CardProps = {
  title: string;
  change?: string;
  value: string;
  valueDescription: string;
  subtitle: string;
  ctaDescription: string;
  ctaText: string;
  ctaLink: string;
  child: number;
  parent: number;
};

const getProgressColor = (value: number) => {
  if (value < 50) {
    return "error";
  }
  if (value < 75) {
    return "warning";
  }
  return "success";
};

export function CircleProgressCard({
  title,
  change,
  value,
  valueDescription,
  subtitle,
  ctaDescription,
  ctaText,
  ctaLink,
  child,
  parent,
}: CardProps) {
  return (
    <>
      <div className="flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
              {title}
            </h3>
            {change && <Badge variant="neutral">{change}</Badge>}
          </div>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-xl text-gray-900 dark:text-gray-50">
              {value}
            </span>
            <span className="text-sm text-gray-500">{valueDescription}</span>
          </p>
          <div className="mt-8 px-1 flex items-center gap-x-8">
            <ProgressCircle
              strokeWidth={8}
              variant={getProgressColor((child / parent) * 100)}
              value={(child / parent) * 100}
              radius={50}
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {Math.round((child / parent) * 100 * 10) / 10}%
              </span>
            </ProgressCircle>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {child} / {parent}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-6 text-xs text-gray-500">
          {ctaDescription}{" "}
          <a href={ctaLink} className="text-indigo-600 dark:text-indigo-400">
            {ctaText}
          </a>
        </p>
      </div>
    </>
  );
}
