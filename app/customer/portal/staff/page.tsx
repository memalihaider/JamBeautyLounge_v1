'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Instagram,
  Twitter,
  ChevronRight,
  Loader2,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Award,
  Sparkles,
  TrendingUp,
  Home,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  image: string;
  specialties: string[];
  branchId: string;
  branch?: string;
  bio: string;
  socials?: {
    instagram?: string;
    twitter?: string;
  };
  status?: 'available' | 'busy' | 'offline';
  currentlyServing?: number;
  averageWaitTime?: number;
  nextAvailable?: string;
  experience?: string;
  skills?: string[];
  upcomingSlots?: Array<{
    date: string;
    time: string;
    available: boolean;
  }>;
  recentReviews?: Array<{
    customerName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function StaffPortal() {
  const router = useRouter();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');
  const [refreshing, setRefreshing] = useState(false);
  const unsubscribeRef = useRef<any>(null);

  // Real-time staff data listener
  useEffect(() => {
    setLoading(true);

    try {
      // Create query with real-time listener
      const staffQuery = query(
        collection(db, 'staff'),
        orderBy('rating', 'desc'),
        orderBy('reviews', 'desc')
      );

      // Subscribe to real-time updates
      unsubscribeRef.current = onSnapshot(
        staffQuery,
        (snapshot) => {
          const staffData: StaffMember[] = [];

          snapshot.forEach((doc) => {
            const data = doc.data();
            staffData.push({
              id: doc.id,
              name: data.name || '',
              role: data.role || '',
              rating: data.rating || 0,
              reviews: data.reviews || 0,
              image: data.image || '',
              specialties: data.specialties || [],
              branchId: data.branchId || '',
              branch: data.branch || '',
              bio: data.bio || '',
              socials: data.socials || {},
              status: data.status || 'available',
              currentlyServing: data.currentlyServing || 0,
              averageWaitTime: data.averageWaitTime || 5,
              nextAvailable: data.nextAvailable || 'Now',
              experience: data.experience || '',
              skills: data.skills || [],
              upcomingSlots: data.upcomingSlots || [],
              recentReviews: data.recentReviews || [],
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          });

          setStaff(staffData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching staff:', error);
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    } catch (error) {
      console.error('Error setting up staff listener:', error);
      setLoading(false);
    }
  }, []);

  // Filter and sort staff
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.specialties.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesRating =
      filterRating === 'all' ||
      (filterRating === '4+' && member.rating >= 4) ||
      (filterRating === '3+' && member.rating >= 3) ||
      (filterRating === '5' && member.rating === 5);

    return matchesSearch && matchesRole && matchesRating;
  });

  // Sort staff
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'reviews') return b.reviews - a.reviews;
    return a.name.localeCompare(b.name);
  });

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Handle booking
  const handleBookStaff = (member: StaffMember) => {
    router.push(
      `/customer/portal/bookings?staffId=${member.id}&staffName=${member.name}`
    );
  };

  // Get unique roles for filter
  const uniqueRoles = Array.from(new Set(staff.map((s) => s.role)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading available staff...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/customer/portal" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portal</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Staff</h1>
          <p className="text-gray-600">
            Browse our talented team members and book your appointment
          </p>
        </div>

        {/* Real-time Status Bar */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">
                  {staff.filter((s) => s.status === 'available').length} Staff Members Available
                </p>
                <p className="text-sm text-gray-600">
                  Real-time updates • Avg. wait time: 5-10 minutes
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, role, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Filter:</span>
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4+">4+ Stars</option>
              <option value="3+">3+ Stars</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <option value="rating">Highest Rating</option>
              <option value="reviews">Most Reviews</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Staff Grid */}
        {sortedStaff.length === 0 ? (
          <Card className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No staff members found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filters
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedStaff.map((member) => (
              <Card
                key={member.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedStaff(member)}
              >
                {/* Header with Status */}
                <div className="relative bg-linear-to-r from-blue-500 to-blue-600 h-24 overflow-hidden">
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity" />
                  {/* Status Badge */}
                  <Badge
                    className={cn(
                      'absolute top-3 right-3 gap-1',
                      member.status === 'available'
                        ? 'bg-green-500 hover:bg-green-600'
                        : member.status === 'busy'
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : 'bg-gray-500 hover:bg-gray-600'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-white" />
                    {member.status || 'Available'}
                  </Badge>
                </div>

                {/* Avatar */}
                <div className="px-6 pb-4 -mt-10 relative z-10">
                  <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback className="bg-blue-500 text-white text-lg">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Content */}
                <CardContent className="px-6 pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {member.name}
                    </h3>
                    <p className="text-sm text-blue-600 font-semibold">
                      {member.role}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-4 h-4',
                            i < Math.floor(member.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {member.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({member.reviews} reviews)
                    </span>
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {member.bio}
                    </p>
                  )}

                  {/* Specialties */}
                  {member.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {member.specialties.slice(0, 2).map((specialty, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {member.specialties.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{member.specialties.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Real-time Info */}
                  <div className="space-y-2 py-3 border-t border-gray-200">
                    {member.averageWaitTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>
                          Avg. wait: <span className="font-semibold">{member.averageWaitTime} min</span>
                        </span>
                      </div>
                    )}
                    {member.nextAvailable && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span>
                          Next available: <span className="font-semibold">{member.nextAvailable}</span>
                        </span>
                      </div>
                    )}
                    {member.currentlyServing !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MessageSquare className="w-4 h-4 text-amber-600" />
                        <span>
                          Serving: <span className="font-semibold">{member.currentlyServing} client(s)</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookStaff(member);
                      }}
                    >
                      Book Now
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStaff(member);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedStaff && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedStaff(null)}
          >
            <Card
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="bg-linear-to-r from-blue-500 to-blue-600 text-white pb-20 relative">
                <Button
                  variant="ghost"
                  className="absolute top-4 right-4 text-white hover:bg-blue-700"
                  onClick={() => setSelectedStaff(null)}
                >
                  ✕
                </Button>
                <div className="flex items-start gap-4">
                  <Avatar className="w-24 h-24 border-4 border-white">
                    <AvatarImage
                      src={selectedStaff.image}
                      alt={selectedStaff.name}
                    />
                    <AvatarFallback className="bg-blue-300 text-lg">
                      {selectedStaff.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">
                      {selectedStaff.name}
                    </h2>
                    <p className="text-blue-100 font-semibold mb-2">
                      {selectedStaff.role}
                    </p>
                    {selectedStaff.branch && (
                      <div className="flex items-center gap-2 text-blue-100 text-sm">
                        <MapPin className="w-4 h-4" />
                        {selectedStaff.branch}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Current Status</p>
                    <Badge
                      className={cn(
                        'mt-1 gap-2',
                        selectedStaff.status === 'available'
                          ? 'bg-green-500 hover:bg-green-600'
                          : selectedStaff.status === 'busy'
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'bg-gray-500 hover:bg-gray-600'
                      )}
                    >
                      <span className="w-2 h-2 rounded-full bg-white" />
                      {selectedStaff.status || 'Available'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 font-medium">Rating</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-5 h-5',
                              i < Math.floor(selectedStaff.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            )}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-gray-900">
                        {selectedStaff.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedStaff.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600">{selectedStaff.bio}</p>
                  </div>
                )}

                {/* Specialties */}
                {selectedStaff.specialties.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStaff.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Real-time Availability */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Real-time Availability
                  </h3>
                  <div className="space-y-2">
                    {selectedStaff.averageWaitTime && (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Average Wait Time:</span>{' '}
                        {selectedStaff.averageWaitTime} minutes
                      </p>
                    )}
                    {selectedStaff.nextAvailable && (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Next Available:</span>{' '}
                        {selectedStaff.nextAvailable}
                      </p>
                    )}
                    {selectedStaff.currentlyServing !== undefined && (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Currently Serving:</span>{' '}
                        {selectedStaff.currentlyServing} client(s)
                      </p>
                    )}
                  </div>
                </div>

                {/* Recent Reviews */}
                {selectedStaff.recentReviews &&
                  selectedStaff.recentReviews.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Recent Reviews ({selectedStaff.reviews})
                      </h3>
                      <div className="space-y-3">
                        {selectedStaff.recentReviews
                          .slice(0, 3)
                          .map((review, idx) => (
                            <div
                              key={idx}
                              className="border border-gray-200 rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-gray-900">
                                  {review.customerName}
                                </p>
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        'w-4 h-4',
                                        i < review.rating
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-gray-300'
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">
                                {review.comment}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {review.date}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Socials */}
                {selectedStaff.socials &&
                  (selectedStaff.socials.instagram ||
                    selectedStaff.socials.twitter) && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Follow
                      </h3>
                      <div className="flex gap-3">
                        {selectedStaff.socials.instagram && (
                          <a
                            href={`https://instagram.com/${selectedStaff.socials.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity"
                          >
                            <Instagram className="w-4 h-4" />
                            Instagram
                          </a>
                        )}
                        {selectedStaff.socials.twitter && (
                          <a
                            href={`https://twitter.com/${selectedStaff.socials.twitter.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                          >
                            <Twitter className="w-4 h-4" />
                            Twitter
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                {/* Book Button */}
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold"
                  onClick={() => {
                    handleBookStaff(selectedStaff);
                  }}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment with {selectedStaff.name}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
