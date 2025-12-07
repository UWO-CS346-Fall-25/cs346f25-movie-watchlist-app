/**
 * Authentication Service using Supabase Auth
 *
 * Handles user registration, login, and session management
 */

const supabase = require('../config/supabase');
const { admin: supabaseAdmin } = require('../config/supabase');
const loggingService = require('./loggingService');

class AuthService {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Registration result
   */
  async register(email, password) {
    try {
      loggingService.logAuthAttempt(email, 'register');

      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        loggingService.logAuthFailure(email, error.message, 'register');
        throw new Error(`Registration failed: ${error.message}`);
      }

      loggingService.logAuthSuccess(data.user.id, email, 'register');

      return {
        success: true,
        user: data.user,
        session: data.session,
        message:
          'Registration successful! Please check your email to verify your account.',
      };
    } catch (error) {
      loggingService.logAuthFailure(email, error.message, 'register');
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
      loggingService.logAuthAttempt(email, 'login');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        loggingService.logAuthFailure(email, error.message, 'login');
        throw new Error(`Login failed: ${error.message}`);
      }

      loggingService.logAuthSuccess(data.user.id, email, 'login');

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      loggingService.logAuthFailure(email, error.message, 'login');
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Logout user
   * @param {string} userId - Optional user ID for logging
   * @returns {Promise<Object>} Logout result
   */
  async logout(userId = null) {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        loggingService.logAuthFailure('unknown', error.message, 'logout');
        throw new Error(`Logout failed: ${error.message}`);
      }

      if (userId) {
        loggingService.logAuthSuccess(userId, 'unknown', 'logout');
      }

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      loggingService.logAuthFailure('unknown', error.message, 'logout');
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
   * Get user by ID (Uses DB Client)
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
   * @param {string} accessToken - REQUIRED: The user's access token to prove identity
   * @returns {Promise<Object>} Update result
   */
  async updateEmail(newEmail, accessToken) {
    try {
      if (!accessToken) {
        throw new Error('Authentication required to update email');
      }

      // 1. Set the session on the client so it knows who is making the request
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: accessToken, // Often required by the method signature
      });

      if (sessionError) {
        console.warn(
          'Session set warning (might be expired, trying anyway):',
          sessionError.message
        );
      }

      // 2. Perform the update
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
          'Email update initiated! Please check your new email address and click the confirmation link to complete the change.',
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
   * @param {string} accessToken - REQUIRED: The user's access token
   * @returns {Promise<Object>} Update result
   */
  async updatePassword(newPassword, accessToken) {
    try {
      if (!accessToken) {
        throw new Error('Authentication required to update password');
      }

      // 1. Set the session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: accessToken,
      });

      if (sessionError) {
        console.warn(
          'Session set warning (might be expired, trying anyway):',
          sessionError.message
        );
      }

      // 2. Perform the update
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

  /**
   * Delete user account completely from Supabase Auth
   * Note: This completely removes the user from Supabase Auth so they cannot log back in.
   * @param {string} accessToken - User's access token
   * @returns {Promise<Object>} Delete result
   */
  async deleteAccount(accessToken) {
    try {
      // Set the session to authenticate the user and get their ID
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: accessToken,
      });

      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      // Get current user
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser();

      if (getUserError || !user) {
        throw new Error(
          `Could not get user: ${getUserError?.message || 'User not found'}`
        );
      }

      // Delete the user from Supabase Auth using admin client
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
        user.id
      );

      if (deleteError) {
        throw new Error(`Account deletion failed: ${deleteError.message}`);
      }

      // Sign out is not needed since user is deleted, but let's do it for safety
      await supabase.auth.signOut();

      loggingService.logAuthSuccess(user.id, user.email, 'delete_account');

      return {
        success: true,
        message: 'Account deleted successfully',
        userId: user.id, // Return userId so we can delete from our database
      };
    } catch (error) {
      loggingService.logAuthFailure('unknown', error.message, 'delete_account');
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new AuthService();
