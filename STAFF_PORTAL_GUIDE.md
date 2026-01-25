# Staff Portal Guide

## Overview

The Staff Portal is a real-time staff directory and booking management system that allows customers to browse available staff members, view their details, and book appointments directly from the customer portal.

## Features

### 1. **Real-Time Staff Information**
- Live staff availability status (Available, Busy, Offline)
- Current wait times
- Next available appointment slots
- Number of clients currently being served
- Real-time updates using Firebase listeners

### 2. **Advanced Search & Filtering**
- Search by staff name, role, or specialties
- Filter by staff role/position
- Filter by rating (5 stars, 4+, 3+, All ratings)
- Sort by:
  - Highest Rating
  - Most Reviews
  - Name (A-Z)

### 3. **Staff Cards Display**
Each staff member card shows:
- Profile photo
- Current availability status (with color-coded badge)
- Name and role
- Star rating and review count
- Bio/description
- Specialties (as badges)
- Real-time metrics:
  - Average wait time
  - Next available time
  - Currently serving count

### 4. **Detailed Staff Profile**
Click "View Details" or staff card to see:
- Complete profile information
- Current status
- Rating and review count
- Bio/description
- All specialties
- Real-time availability details
- Recent customer reviews
- Social media links (Instagram, Twitter)
- Book appointment button

### 5. **Easy Booking**
- "Book Now" button on each staff card
- Direct integration with booking system
- Pre-filled staff selection when booking

## File Structure

```
app/customer/portal/
├── page.tsx                    # Main portal page with staff tab
├── staff/
│   └── page.tsx               # Staff directory page
```

## Firestore Data Structure

The staff portal reads from the Firebase `staff` collection:

```typescript
{
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
```

## How to Use

### For Customers:

1. **Access the Staff Portal:**
   - Navigate to `/customer/portal/staff` directly, OR
   - Click the "Staff" tab in the customer portal, OR
   - Click "View All Staff" button on the home page

2. **Browse Staff:**
   - Use the search bar to find specific staff members
   - Apply filters to narrow down results
   - Sort by rating, reviews, or name

3. **View Profile:**
   - Click on a staff card to see detailed information
   - Check real-time availability
   - Read recent reviews from other customers

4. **Book Appointment:**
   - Click "Book Now" on any staff card
   - You'll be redirected to the booking form
   - The staff member will be pre-selected

### For Developers:

#### Setting Up Real-Time Updates

The staff portal uses Firebase's `onSnapshot` for real-time updates:

```typescript
const staffQuery = query(
  collection(db, 'staff'),
  orderBy('rating', 'desc'),
  orderBy('reviews', 'desc')
);

const unsubscribe = onSnapshot(staffQuery, (snapshot) => {
  const staffData = [];
  snapshot.forEach((doc) => {
    staffData.push({ id: doc.id, ...doc.data() });
  });
  setStaff(staffData);
});
```

#### Adding a Staff Member

To add a new staff member to Firebase:

```typescript
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const staffData = {
  name: 'John Doe',
  role: 'Master Barber',
  rating: 4.9,
  reviews: 128,
  image: 'https://...',
  specialties: ['Classic Haircuts', 'Fades', 'Beard Grooming'],
  branchId: 'downtown',
  branch: 'Downtown Branch',
  bio: 'Experienced barber with 10+ years...',
  status: 'available',
  currentlyServing: 0,
  averageWaitTime: 5,
  nextAvailable: 'Now',
  socials: {
    instagram: '@johndoe_barber',
    twitter: '@johndoe'
  },
  createdAt: serverTimestamp(),
};

const docRef = await addDoc(collection(db, 'staff'), staffData);
```

#### Updating Staff Status

```typescript
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';

await updateDoc(doc(db, 'staff', staffId), {
  status: 'busy', // or 'available', 'offline'
  currentlyServing: 2,
  averageWaitTime: 15,
  nextAvailable: '3:30 PM',
  updatedAt: serverTimestamp(),
});
```

## Integration Points

### 1. **Home Page**
- Staff section on homepage with "View All Staff" button
- Links to `/customer/portal/staff`

### 2. **Customer Portal**
- New "Staff" tab in the customer portal
- Displays staff directory overview

### 3. **Booking System**
- Staff portal integrates with existing booking system
- Pre-selects staff when booking through portal
- Stores staff information in booking records

## Styling & UI Components

The staff portal uses:
- **Radix UI components:** Button, Card, Avatar, Badge, Tabs, Input
- **Lucide icons:** Users, Star, Clock, Calendar, MapPin, Instagram, Twitter, etc.
- **TailwindCSS:** For responsive design and styling
- **Next.js Image handling:** For optimized image loading

## Performance Optimizations

1. **Real-time listeners:** Firebase listeners automatically update data
2. **Lazy loading:** Images use Next.js Image optimization
3. **Search & filter:** Client-side filtering for instant results
4. **Responsive design:** Mobile-first approach with breakpoints

## Customization

### Change Color Scheme
Update the Badge colors in the staff card component based on status:

```typescript
member.status === 'available'
  ? 'bg-green-500 hover:bg-green-600'
  : member.status === 'busy'
    ? 'bg-amber-500 hover:bg-amber-600'
    : 'bg-gray-500 hover:bg-gray-600'
```

### Add More Staff Fields
1. Update the `StaffMember` interface
2. Add fields to Firebase document
3. Update the display in cards and detail view

### Customize Sort Options
Add more sort options in the select dropdown:

```typescript
<select
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value as any)}
>
  <option value="rating">Highest Rating</option>
  <option value="reviews">Most Reviews</option>
  <option value="name">Name (A-Z)</option>
  <option value="experience">Experience</option>
</select>
```

## Troubleshooting

### Staff data not loading
- Check Firestore rules allow reading from `staff` collection
- Verify Firebase connection in `/lib/firebase.ts`
- Check browser console for errors

### Real-time updates not working
- Ensure customer is logged in (required for `CustomerAuthContext`)
- Check Firebase rules for real-time listener permissions
- Verify Firestore listener subscription is active

### Images not displaying
- Verify image URLs are valid
- Check CORS settings for external image URLs
- Use default image if URL is invalid

## Future Enhancements

- [ ] Calendar integration for viewing available slots
- [ ] Direct messaging with staff members
- [ ] Staff reviews and ratings
- [ ] Favorite staff members
- [ ] Staff availability scheduling
- [ ] Performance metrics and analytics
- [ ] Availability calendar view
- [ ] Social media integration

## Support

For issues or questions about the staff portal:
1. Check Firestore database for correct data structure
2. Verify authentication context is properly set up
3. Review browser console for error messages
4. Check Firebase rules and permissions

---

**Last Updated:** January 25, 2026
**Version:** 1.0.0
