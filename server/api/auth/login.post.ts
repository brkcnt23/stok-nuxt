import { User } from '~~/server/models/User';
import { setCookie } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return createError({
        statusCode: 400,
        message: 'Kullanıcı adı ve şifre zorunludur',
      });
    }

    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return createError({
        statusCode: 401,
        message: 'Geçersiz kullanıcı adı veya şifre',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return createError({
        statusCode: 401,
        message: 'Geçersiz kullanıcı adı veya şifre',
      });
    }

    
    // Direkt cookie yaklaşımı - session modülü kullanmadan
    setCookie(event, 'auth-token', JSON.stringify({
      _id: user._id.toString(),
      username: user.username
    }), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 hafta
      secure: process.env.NODE_ENV === 'production'
    });

    return {
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        createdAt: user.createdAt,
      },
    };
  } catch (error: any) {
    console.error('Login hatası:', error);
    return createError({
      statusCode: 500,
      message: error.message || 'Giriş yapılırken bir hata oluştu',
    });
  }
});
