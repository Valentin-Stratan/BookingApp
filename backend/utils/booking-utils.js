const utils = require('./utils');

module.exports = {
    validateEmail: function validateEmail(email) {
        return (!email ? false : (!utils.mailFormat.test(email) ? false : true));
    },
    validatePhone: function validatePhone(phone) {
        return (!phone ? false : (phone.length > 16 ? false : true));
    },
    validateName: function validateName(name) {
        return (!name ? false : (name.length > 40 ? false : true));
    },

    validateBooking: function validateBooking(employee, newBookingSlot, allBookings, service) {

        // format mm dd yyyy hour:minute
        const date = new Date(newBookingSlot);
        const newBookingHour = date.getHours();
        const newBookingMinutes = date.getMinutes();

        if (newBookingHour > employee.finish_time || newBookingHour < employee.start_time)
                return false;

        // iterate through all bookings
        for (let i = 0; i < allBookings.length; i++) {
            // get hour when service was booked
            const bookedServiceHour = new Date(allBookings[i].slot).getHours();
            // get minutes when service was booked
            const bookedServiceMinutes = new Date(allBookings[i].slot).getMinutes();
            // get duration of booked service
            const serviceDuration = parseInt(service.duration.slice(0, 2));

            // check if booked service has same hour as the new booking
            if (bookedServiceHour === newBookingHour) {
                return false;
            }
            // check if booked service is between the new booking and -1 service duration
            // if yes, space of booked service will be unavailable for new booking
            else if (bookedServiceHour < newBookingHour && bookedServiceHour === newBookingHour - serviceDuration) {
                if (bookedServiceMinutes > newBookingMinutes) {
                    return false;
                }
            }
            // check if booked service is between the new booking and +1 service duration
            // if yes, space of booked service will be unavailable for new booking
            else if (bookedServiceHour === newBookingHour + serviceDuration) {
                //if(bookedServiceMinutes === newBookingMinutes || bookedServiceMinutes > newBookingMinutes){
                if (bookedServiceMinutes < newBookingMinutes) {
                    return false
                }
            }
        }
        return true;
    },

    sendConfirmation: async function sendConfirmation(employeeEmail, clientEmail, bookingId) {
        // send confirmation mail to client
        await utils.sendMail(clientEmail, `Your booking id is: ${bookingId}` , 'Booking confirmation');
        // send notification mail to employee
        await utils.sendMail(employeeEmail, `Assigned to booking with id: ${bookingId}`, 'Booking notification');
    }
}