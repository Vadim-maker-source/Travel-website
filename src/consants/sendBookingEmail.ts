import emailjs from '@emailjs/browser';

export const sendBookingEmail = async ({
    email,
    status,
    hotelName,
    bookingId,
    totalPrice,
  }: {
    email: string;
    status: 'confirmed' | 'cancelled';
    hotelName: string;
    bookingId: string;
    totalPrice?: number;
  }) => {
    const statusText = status === 'confirmed' ? 'подтверждено' : 'отклонено';
  
    try {
      const result = await emailjs.send(
        'service_wau4hhc',
        'template_pv77ycj',
        {
          user_email: email,
          status: statusText,
          hotelName,
          bookingId: bookingId.slice(0, 6),
          totalPrice: status === 'confirmed' ? 'Сумма к оплате: ' + totalPrice + ' рублей' : '',
        },
        '06C32qHukufYdmFpI'
      );
  
      console.log('Email sent successfully', result.status, result.text);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  };  