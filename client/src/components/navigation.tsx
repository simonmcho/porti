import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { Store, User, LogOut, Settings, PlusCircle } from "lucide-react";

export function Navigation() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex-shrink-0 flex items-center cursor-pointer">
                <Store className="text-coral text-2xl mr-2" />
                <span className="text-2xl font-bold text-gray-warm">Porti</span>
              </div>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/">
                  <a className="text-gray-warm hover:text-coral px-3 py-2 rounded-md text-sm font-medium">
                    Discover
                  </a>
                </Link>
                <Link href="/business-registration">
                  <a className="text-gray-warm hover:text-coral px-3 py-2 rounded-md text-sm font-medium">
                    For Businesses
                  </a>
                </Link>
                <Link href="/user-dashboard">
                  <a className="text-gray-warm hover:text-coral px-3 py-2 rounded-md text-sm font-medium">
                    Gift Cards
                  </a>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/business-registration">
              <Button className="hidden md:block bg-coral text-white hover:bg-coral-light">
                <PlusCircle className="mr-2 h-4 w-4" />
                List Your Business
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || 'User'} />
                    <AvatarFallback>
                      {user?.firstName ? user.firstName[0] : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.firstName && (
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                    )}
                    {user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-t my-1"></div>
                <Link href="/user-dashboard">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link href="/business-registration">
                  <DropdownMenuItem>
                    <Store className="mr-2 h-4 w-4" />
                    My Business
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <div className="border-t my-1"></div>
                <DropdownMenuItem
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
