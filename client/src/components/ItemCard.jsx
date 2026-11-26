import React from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Tag, ArrowRight, PackageSearch } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function ItemCard({ item }) {
  const imgSrc = item.image_path || item.image_url || null;
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-xs transition-all hover:-translate-y-0.5 hover:border-[#2878B9]/40 hover:shadow-md">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F3F5F9]">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-[#64748B]">
            <PackageSearch className="h-8 w-8 text-[#183B63]/40" />
            <span className="text-xs font-medium">No photo provided</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <StatusBadge
            status={item.report_type}
            className="bg-white/95 backdrop-blur-xs shadow-2xs"
          />
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge
            status={item.status}
            className="bg-white/95 backdrop-blur-xs shadow-2xs"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#2878B9]">
          <Tag className="h-3.5 w-3.5" />
          <span>{item.category}</span>
        </div>

        <h3 className="mt-1.5 line-clamp-1 text-base font-semibold text-[#172B4D] group-hover:text-[#183B63]">
          {item.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#64748B]">
          {item.description}
        </p>

        <div className="mt-4 space-y-1.5 border-t border-[#E2E8F0] pt-3 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#183B63]" />
            <span className="truncate">{item.location_text}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-[#183B63]" />
            <span>{String(item.incident_date).slice(0, 10)}</span>
          </div>
        </div>

        <Link
          to={`/items/${item.id}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#183B63] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2878B9]"
        >
          View Details
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
