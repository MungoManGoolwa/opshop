import React from "react";
import { Home, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  showHomeButton?: boolean;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs = [],
  showHomeButton = true,
  actions,
}: PageHeaderProps) {
  return (
    <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="mb-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="flex items-center gap-1">
                      <Home className="h-3 w-3" />
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {item.href && index < breadcrumbs.length - 1 ? (
                        <BreadcrumbLink asChild>
                          <Link href={item.href}>{item.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showHomeButton && (
              <Button asChild variant="outline" size="sm">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
              </Button>
            )}
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}