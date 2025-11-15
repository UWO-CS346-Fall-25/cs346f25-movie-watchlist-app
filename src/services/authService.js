/**
 * Authentication Service using Supabase Auth
 *
 * Handles user registration, login, and session management
 */

const supabase = require('../config/supabase');

class AuthService {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Registration result
   */
  async register(email, password) {
    try {
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        throw new Error(`Registration failed: ${error.message}`);
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        message:
          'Registration successful! Please check your email to verify your account.',
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw new Error(`Login failed: ${error.message}`);
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} Logout result
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(`Logout failed: ${error.message}`);
      }

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get current user session
   * @returns {Promise<Object>} Current session
   */
  async getCurrentSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw new Error(`Session error: ${error.message}`);
      }

      return {
        success: true,
        session: session,
        user: session?.user || null,
      };
    } catch (error) {
      console.error('Session error:', error);
      return {
        success: false,
        error: error.message,
        session: null,
        user: null,
      };
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error(`User lookup failed: ${error.message}`);
      }

      return {
        success: true,
        user: data,
      };
    } catch (error) {
      console.error('User lookup error:', error);
      return {
        success: false,
        error: error.message,
        user: null,
      };
    }
  }

  /**
   * Update user email
   * @param {string} newEmail - New email address
   * @returns {Promise<Object>} Update result
   */
  async updateEmail(newEmail) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) {
        throw new Error(`Email update failed: ${error.message}`);
      }

      return {
        success: true,
        user: data.user,
        message:
          'Email updated successfully! Please check your new email to confirm the change.',
      };
    } catch (error) {
      console.error('Email update error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update user password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Update result
   */
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(`Password update failed: ${error.message}`);
      }

      return {
        success: true,
        user: data.user,
        message: 'Password updated successfully!',
      };
    } catch (error) {
      console.error('Password update error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Reset password
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset result
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.APP_URL || 'http://localhost:3000'}/users/reset-password`,
      });

      if (error) {
        throw new Error(`Password reset failed: ${error.message}`);
      }

      return {
        success: true,
        message: 'Password reset email sent! Check your inbox.',
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new AuthService();
