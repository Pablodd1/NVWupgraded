// In-memory mock storage for slots (resets on server restart)
export const mockSlots: any[] = [
    {
        _id: "slot1",
        wineryId: "657999acac9c9c0012345671",
        date: new Date().toISOString().split('T')[0],
        timeSlot: "Morning (10:00 AM - 12:00 PM)",
        totalCapacity: 20,
        bookedCapacity: 5,
        availableCapacity: 15,
        isBlocked: false,
        status: "available",
    },
    {
        _id: "slot2",
        wineryId: "657999acac9c9c0012345671",
        date: new Date().toISOString().split('T')[0],
        timeSlot: "Afternoon (12:00 PM - 3:00 PM)",
        totalCapacity: 20,
        bookedCapacity: 20,
        availableCapacity: 0,
        isBlocked: false,
        status: "full",
    }
];

export function getMockSlots(wineryId: string) {
    return mockSlots.filter(s => s.wineryId === wineryId);
}

export function addMockSlot(wineryId: string, slotData: any) {
    const newSlot = {
        _id: "mock_" + Math.random().toString(36).substr(2, 9),
        wineryId,
        date: slotData.date,
        timeSlot: slotData.timeSlot,
        totalCapacity: slotData.totalCapacity,
        bookedCapacity: 0,
        availableCapacity: slotData.totalCapacity,
        isBlocked: false,
        status: "available",
    };
    mockSlots.push(newSlot);
    return newSlot;
}

export function updateMockSlot(slotId: string, updates: any) {
    const index = mockSlots.findIndex(s => s._id === slotId);
    if (index !== -1) {
        mockSlots[index] = { ...mockSlots[index], ...updates };
        if (updates.totalCapacity !== undefined) {
            mockSlots[index].availableCapacity = mockSlots[index].totalCapacity - mockSlots[index].bookedCapacity;
        }
        return mockSlots[index];
    }
    return null;
}
