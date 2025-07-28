import { useAuth } from "@/hooks/useAuth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, UserX, ChevronDown } from "lucide-react";

export default function LogoutDropdown() {
  const { user, logout, completeLogout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
          {(user as any)?.profileImageUrl ? (
            <img 
              src={(user as any).profileImageUrl} 
              alt="Profile" 
              className="w-6 h-6 rounded-full object-cover" 
            />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span className="text-sm hidden sm:block">{(user as any)?.firstName || "User"}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {(user as any)?.firstName || "User"} {(user as any)?.lastName || ""}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {(user as any)?.email || ""}
            </p>
            <p className="text-xs leading-none text-muted-foreground capitalize">
              Role: {(user as any)?.role || "customer"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <UserX className="mr-2 h-4 w-4" />
          <span>Switch User</span>
          <span className="ml-auto text-xs text-muted-foreground">Ctrl+U</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={completeLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Complete Logout</span>
          <span className="ml-auto text-xs text-muted-foreground">Ctrl+Q</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}