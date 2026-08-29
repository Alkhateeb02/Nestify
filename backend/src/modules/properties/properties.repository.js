import prisma from '../../config/prisma.js';
import { Property } from '../../domain/entities/Property.js';

export class PropertyRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async createListing(listingData) {
    const { landlord_id, title, description, address, price, properties_image, ...rest } = listingData;
    
    // Parse locationLink for coordinates if possible
    let latitude = 31.9565783; // Default Amman coordinates
    let longitude = 35.8485906;
    if (rest.locationLink) {
      const matchAt = rest.locationLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (matchAt) {
        latitude = parseFloat(matchAt[1]);
        longitude = parseFloat(matchAt[2]);
      } else {
        const matchQ = rest.locationLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (matchQ) {
          latitude = parseFloat(matchQ[1]);
          longitude = parseFloat(matchQ[2]);
        }
      }
    }
    if (rest.latitude) latitude = Number(rest.latitude);
    if (rest.longitude) longitude = Number(rest.longitude);

    const tagsObj = {
      type: rest.type || 'Standard',
      capacity: rest.capacity || 1,
      images: rest.images || [],
      features: rest.features || [],
      nearby: rest.nearby || { supermarkets: [], laundry: [], hospitals: [], gasStations: [] },
      gender: rest.gender || 'Mixed',
      listingType: rest.listingType || 'Solo',
      rules: rest.rules || [],
      locationLink: rest.locationLink || '',
      currency: rest.currency || 'JOD',
      rentalPeriod: rest.rentalPeriod || 'monthly',
      area: rest.area !== undefined && rest.area !== null ? Number(rest.area) : null,
      ...rest.ai_tags
    };

    let propertyRecord = await this.prisma.property.create({
      data: {
        landlord_id: BigInt(landlord_id),
        title,
        description,
        address: address || 'No Address Provided',
        properties_image: properties_image || null,
        ai_tags: JSON.stringify(tagsObj),
        rental_period: rest.rentalPeriod || 'monthly',
        currency: rest.currency || 'JOD',
        size: rest.area !== undefined && rest.area !== null ? Number(rest.area) : null,
        maps_url: rest.locationLink || null,
        house_rules: rest.rules || [],
        nearby_places: rest.nearby || { supermarkets: [], laundry: [], hospitals: [], gasStations: [] },
        location: {
          create: {
            latitude,
            longitude,
            google_place_id: rest.locationLink || null,
            formatted_address: address || null,
            city: rest.city || null,
            area: null
          }
        },
        units: price ? {
          create: {
            type: 'Standard',
            price: price,
            availability_status: 'available'
          }
        } : undefined
      },
      include: { 
        units: true,
        location: true
      }
    });

    // Folder transition renaming hook: Move property images from temp/ to Propertie_{property_id}
    const { images: movedImages, propertiesImage: movedPropImage } = await this._movePropertyImages(
      propertyRecord.property_id,
      landlord_id,
      tagsObj.images,
      propertyRecord.properties_image
    );

    const finalTagsObj = {
      ...tagsObj,
      images: movedImages
    };

    propertyRecord = await this.prisma.property.update({
      where: { property_id: propertyRecord.property_id },
      data: {
        properties_image: movedPropImage,
        ai_tags: JSON.stringify(finalTagsObj)
      },
      include: { units: true, location: true }
    });

    return this._mapToDomain(propertyRecord);
  }

  async updateListing(id, updateData) {
    const { landlord_id, properties_image, price, capacity, gender, type, features, images, listingType, nearby, rules, locationLink, currency, rentalPeriod, area, ...rest } = updateData;
    
    // Fetch current listing to get existing ai_tags
    const current = await this.prisma.property.findUnique({
      where: { property_id: BigInt(id) },
      include: { units: true, location: true }
    });
    
    if (!current) throw new Error('Listing not found');

    let currentTags = {};
    if (current.ai_tags) {
      try {
        currentTags = JSON.parse(current.ai_tags);
      } catch (e) {
        currentTags = {};
      }
    }

    const updatedAiTags = {
      ...currentTags,
      ...(type ? { type } : {}),
      ...(capacity !== undefined ? { capacity } : {}),
      ...(gender ? { gender } : {}),
      ...(features ? { features } : {}),
      ...(images ? { images } : {}),
      ...(listingType ? { listingType } : {}),
      ...(nearby !== undefined ? { nearby } : {}),
      ...(rules !== undefined ? { rules } : {}),
      ...(locationLink !== undefined ? { locationLink } : {}),
      ...(currency !== undefined ? { currency } : {}),
      ...(rentalPeriod !== undefined ? { rentalPeriod } : {}),
      ...(area !== undefined ? { area: area !== null ? Number(area) : null } : {})
    };

    let latitude = undefined;
    let longitude = undefined;
    if (locationLink) {
      const matchAt = locationLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (matchAt) {
        latitude = parseFloat(matchAt[1]);
        longitude = parseFloat(matchAt[2]);
      } else {
        const matchQ = locationLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (matchQ) {
          latitude = parseFloat(matchQ[1]);
          longitude = parseFloat(matchQ[2]);
        }
      }
    }
    if (rest.latitude !== undefined) latitude = Number(rest.latitude);
    if (rest.longitude !== undefined) longitude = Number(rest.longitude);

    const hasLocationInput = (latitude !== undefined && longitude !== undefined) || locationLink !== undefined || rest.address !== undefined;

    const targetLandlordId = landlord_id || current.landlord_id;
    const { images: movedImages, propertiesImage: movedPropImage } = await this._movePropertyImages(
      id,
      targetLandlordId,
      updatedAiTags.images,
      properties_image !== undefined ? properties_image : current.properties_image
    );

    const updatedAiTagsFinal = {
      ...updatedAiTags,
      images: movedImages
    };

    const dataPayload = {
      properties_image: movedPropImage,
      landlord_id: landlord_id ? BigInt(landlord_id) : undefined,
      ai_tags: JSON.stringify(updatedAiTagsFinal),
      location: hasLocationInput ? {
        upsert: {
          create: {
            latitude: latitude !== undefined ? latitude : 31.9565783,
            longitude: longitude !== undefined ? longitude : 35.8485906,
            google_place_id: locationLink || null,
            formatted_address: rest.address || current.address || null,
            city: rest.city || null,
            area: null
          },
          update: {
            latitude: latitude !== undefined ? latitude : undefined,
            longitude: longitude !== undefined ? longitude : undefined,
            google_place_id: locationLink !== undefined ? locationLink : undefined,
            formatted_address: rest.address !== undefined ? rest.address : undefined,
            city: rest.city !== undefined ? rest.city : undefined
          }
        }
      } : undefined
    };

    if (rest.title !== undefined) dataPayload.title = rest.title;
    if (rest.description !== undefined) dataPayload.description = rest.description;
    if (rest.address !== undefined) dataPayload.address = rest.address;
    if (rentalPeriod !== undefined) dataPayload.rental_period = rentalPeriod;
    if (currency !== undefined) dataPayload.currency = currency;
    if (area !== undefined) dataPayload.size = area !== null ? Number(area) : null;
    if (locationLink !== undefined) dataPayload.maps_url = locationLink;
    if (rules !== undefined) dataPayload.house_rules = rules;
    if (nearby !== undefined) dataPayload.nearby_places = nearby;

    const updatedRecord = await this.prisma.property.update({
      where: { property_id: BigInt(id) },
      data: dataPayload,
      include: { 
        units: true,
        location: true
      }
    });

    if (price !== undefined && updatedRecord.units && updatedRecord.units.length > 0) {
      await this.prisma.unit.update({
        where: { unit_id: updatedRecord.units[0].unit_id },
        data: { price: Number(price) }
      });
      // reload units and location
      const reloaded = await this.prisma.property.findUnique({
        where: { property_id: BigInt(id) },
        include: { units: true, location: true }
      });
      return this._mapToDomain(reloaded);
    }

    return this._mapToDomain(updatedRecord);
  }

  async getListings(filters) {
    const where = {};
    
    if (filters?.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters?.landlord_id) {
      where.landlord_id = BigInt(filters.landlord_id);
    }
    
    const properties = await this.prisma.property.findMany({
      where,
      include: {
        units: {
          include: {
            bookings: true
          }
        },
        location: true,
        landlord: { include: { user: true } },
        reviews: true
      },
      orderBy: { created_at: 'desc' }
    });

    const mapped = properties.map(p => this._mapToDomain(p));

    // Gender-based visibility gate (server-enforced)
    // Male-target dorms → only visible to Male students
    // Female-target dorms → only visible to Female students
    // Mixed / Any → visible to everyone
    if (filters?.userGender) {
      const ug = filters.userGender.charAt(0).toUpperCase() + filters.userGender.slice(1).toLowerCase(); // normalize
      const opposite = ug === 'Male' ? 'Female' : 'Male';
      return mapped.filter(p => {
        const pg = p.gender; // "Male" | "Female" | "Mixed" | "Any"
        return pg !== opposite; // keep if not the strict opposite
      });
    }

    return mapped;
  }

  async getListingById(id) {
    const propertyRecord = await this.prisma.property.findUnique({
      where: { property_id: BigInt(id) },
      include: {
        units: {
          include: {
            bookings: true
          }
        },
        location: true,
        landlord: { include: { user: true } },
        reviews: true
      }
    });

    if (!propertyRecord) return null;
    return this._mapToDomain(propertyRecord);
  }

  async approveListing(id) {
    console.log(`Prisma: Approving property ${id}`);
    return this.getListingById(id);
  }

  async deleteListing(id) {
    const deleted = await this.prisma.property.delete({
      where: { property_id: BigInt(id) },
      include: {
        location: true,
        units: {
          include: {
            bookings: true
          }
        }
      }
    });
    return this._mapToDomain(deleted);
  }

  async _movePropertyImages(propertyId, landlordId, imagesArray, propertiesImage) {
    let targetImages = [];
    let updatedPropertiesImage = propertiesImage;
    if (!imagesArray || imagesArray.length === 0) {
      return { images: imagesArray || [], propertiesImage };
    }

    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const targetDir = path.join('Users_uploads', 'LandLords_Uploads', `user_${landlordId}`, 'Properties', `Propertie_${propertyId}`);
      fs.mkdirSync(targetDir, { recursive: true });

      for (let imgPath of imagesArray) {
        if (imgPath.includes('/Properties/temp/')) {
          let tempPath = imgPath;
          if (tempPath.startsWith('/')) tempPath = tempPath.substring(1);
          if (tempPath.startsWith('\\')) tempPath = tempPath.substring(1);
          
          const filename = path.basename(tempPath);
          const finalPath = path.join(targetDir, filename).replace(/\\/g, '/');
          
          if (fs.existsSync(tempPath)) {
            fs.renameSync(tempPath, finalPath);
            targetImages.push('/' + finalPath);
          } else {
            targetImages.push(imgPath);
          }
        } else {
          targetImages.push(imgPath);
        }
      }

      if (updatedPropertiesImage && updatedPropertiesImage.includes('/Properties/temp/')) {
        let tempPath = updatedPropertiesImage;
        if (tempPath.startsWith('/')) tempPath = tempPath.substring(1);
        if (tempPath.startsWith('\\')) tempPath = tempPath.substring(1);
        const filename = path.basename(tempPath);
        const finalPath = path.join(targetDir, filename).replace(/\\/g, '/');
        updatedPropertiesImage = '/' + finalPath;
      } else if (targetImages.length > 0 && (!updatedPropertiesImage || updatedPropertiesImage.includes('/Properties/temp/'))) {
        updatedPropertiesImage = targetImages[0];
      }
    } catch (err) {
      console.error('Failed to move uploaded property images:', err);
      return { images: imagesArray, propertiesImage };
    }

    return { images: targetImages, propertiesImage: updatedPropertiesImage };
  }

  // Helper method to map Prisma record to Domain Entity
  _mapToDomain(record) {
    let parsedTags = {};
    if (record.ai_tags) {
      try {
        parsedTags = typeof record.ai_tags === 'string' ? JSON.parse(record.ai_tags) : record.ai_tags;
      } catch (e) {
        parsedTags = {};
      }
    }

    const property = new Property({
      propertyID: record.property_id.toString(),
      title: record.title,
      address: record.address,
      description: record.description,
      aiTags: parsedTags,
      location: {
        latitude: record.location?.latitude ? parseFloat(record.location.latitude.toString()) : null,
        longitude: record.location?.longitude ? parseFloat(record.location.longitude.toString()) : null,
        google_place_id: record.location?.google_place_id || null,
        formatted_address: record.location?.formatted_address || null,
        city: record.location?.city || null,
        area: record.location?.area || null
      },
      propertiesImage: record.properties_image
    });
    // Map related entities if necessary (like units, reviews)
    if (record.units) {
      property.units = record.units.map(u => {
        const unitReviews = record.reviews ? record.reviews.filter(r => r.unit_id && r.unit_id.toString() === u.unit_id.toString()) : [];
        const avgRating = unitReviews.length > 0
          ? parseFloat((unitReviews.reduce((sum, r) => sum + r.rating_value, 0) / unitReviews.length).toFixed(1))
          : null;
        return {
          ...u,
          id: u.unit_id.toString(),
          unit_id: u.unit_id.toString(),
          property_id: u.property_id.toString(),
          rating: avgRating
        };
      });
    }
    if (record.reviews) property.reviews = record.reviews;
    if (record.landlord) property.landlord = record.landlord;
    // adding standard id field for front-end
    property.id = property.propertyID;

    // Add root level attributes for direct mapping compatibility in UI (JobList / Browse / Stats)
    const firstUnit = record.units && record.units.length > 0 ? record.units[0] : null;
    property.type = parsedTags?.type || firstUnit?.type || 'Apartment';
    property.capacity = firstUnit && firstUnit.capacity !== undefined ? firstUnit.capacity : (parsedTags?.capacity || 1);
    const featuresArr = parsedTags?.features || [];
    property.features = Array.isArray(featuresArr)
      ? featuresArr.reduce((obj, key) => { obj[key] = true; return obj; }, {})
      : (featuresArr || {});
    property.nearby = record.nearby_places || parsedTags?.nearby || {
      supermarkets: [],
      laundry:      [],
      hospitals:    [],
      gasStations:  [],
    };
    property.gender = parsedTags?.gender || 'Mixed';
    property.images = parsedTags?.images || [];
    property.image = (parsedTags?.images && parsedTags.images[0]) || record.properties_image || null;
    property.listingType = parsedTags?.listingType || parsedTags?.listing_type || 'Solo';

    let activeBookingsCount = 0;
    if (record.units) {
      record.units.forEach(unit => {
        if (unit.bookings) {
          activeBookingsCount += unit.bookings.filter(b => ['pending', 'confirmed', 'approved', 'pending payment', 'pending_payment'].includes((b.status || '').toLowerCase())).length;
        }
      });
    }

    const basePrice = firstUnit ? parseFloat(firstUnit.price.toString()) : 0;
    if (property.listingType === 'Hybrid' && activeBookingsCount > 0) {
      property.price = parseFloat((basePrice / activeBookingsCount).toFixed(2));
    } else {
      property.price = basePrice;
    }

    property.rules = record.house_rules || parsedTags?.rules || [];
    property.locationText = record.address;
    property.locationLink = record.location?.google_place_id || record.maps_url || parsedTags?.locationLink || '';
    property.currency = record.currency || parsedTags?.currency || 'JOD';
    property.rentalPeriod = record.rental_period || parsedTags?.rentalPeriod || 'monthly';
    property.sqft = record.size || parsedTags?.area || parsedTags?.sqft || null;
    property.area = record.size || parsedTags?.area || parsedTags?.sqft || null;

    // Calculate rating based on actual reviews in database
    if (record.reviews && record.reviews.length > 0) {
      const sum = record.reviews.reduce((acc, r) => acc + r.rating_value, 0);
      property.rating = (sum / record.reviews.length).toFixed(1);
    } else {
      property.rating = null;
    }

    // Calculate current occupancy and availability status based on bed capacity and bookings
    let currentOccupancy = 0;
    const capacityNum = Number(property.capacity) || 1;

    if (property.listingType === 'Solo') {
      const isRented = record.units && record.units.length > 0
        ? record.units.every(u => u.availability_status !== 'available')
        : false;
      currentOccupancy = isRented ? capacityNum : 0;
    } else {
      if (record.units) {
        record.units.forEach(unit => {
          if (unit.bookings) {
            currentOccupancy += unit.bookings.filter(b => ['confirmed', 'approved'].includes((b.status || '').toLowerCase())).length;
          }
        });
      }
    }

    property.currentOccupancy = currentOccupancy;
    property.available = currentOccupancy < capacityNum;

    return property;
  }


  async getPropertySchedule(propertyId) {
    const propertyIdBigInt = BigInt(propertyId);
    
    // Fetch bookings (Occupied)
    const bookings = await this.prisma.booking.findMany({
      where: {
        unit: { property_id: propertyIdBigInt },
        status: { in: ['confirmed', 'pending', 'Approved', 'Pending', 'approved', 'Pending Payment', 'pending_payment'] }
      },
      select: { checkin_date: true, status: true }
    });

    // Fetch maintenance tickets (Maintenance)
    const maintenance = await this.prisma.maintenanceTicket.findMany({
      where: {
        unit: { property_id: propertyIdBigInt },
        status: { not: 'Closed' }
      },
      select: { ticket_date: true, status: true }
    });

    return [
      ...bookings.map(b => ({ date: b.checkin_date, type: 'Booked', status: b.status })),
      ...maintenance.map(m => ({ date: m.ticket_date, type: 'Maintenance', status: m.status }))
    ];
  }

  async findExpiredBookings(currentDate) {

    // Step: Scan for all "Occupied" units with expired booking dates (Diagram 4.0.22)
    return await this.prisma.booking.findMany({
      where: {
        checkin_date: { lt: new Date(currentDate) },
        status: { in: ['confirmed', 'Approved', 'approved'] }
      },
      select: { unit_id: true, unit: { select: { property: { select: { landlord_id: true } } } } }
    });
  }

  async updateUnitsToAvailable(unitIds) {
    // Step: Bulk update units to 'Available' (Diagram 4.0.22)
    await this.prisma.unit.updateMany({
      where: { unit_id: { in: unitIds.map(id => BigInt(id)) } },
      data: { availability_status: 'available' }
    });
  }

  async recordView(propertyId, userId, ipAddress) {
    // No-op: Views are disabled in this database schema version
  }

  async getLandlordStats(landlordId) {
    const properties = await this.prisma.property.findMany({
      where: { landlord_id: BigInt(landlordId) },
      include: {
        units: {
          include: {
            bookings: true
          }
        }
      }
    });

    return properties.map(s => {
      let bookingCount = 0;
      if (s.units) {
        s.units.forEach(u => {
          if (u.bookings) bookingCount += u.bookings.length;
        });
      }
      return {
        id: s.property_id.toString(),
        title: s.title,
        views: 0,
        bookings: bookingCount
      };
    });
  }
}


