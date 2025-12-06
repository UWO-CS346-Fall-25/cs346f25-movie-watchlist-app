/**
 * User Model (Supabase Client Version)
 *
 * This model handles all database operations related to users using the
 * Supabase client (HTTP).
 *
 * It supports RLS (Row Level Security) by accepting access tokens
 * to impersonate the authenticated user during updates.
 */

const supabase = require('../config/supabase');

class User {
  /**
   * Retrieves all users from the database.
   *
   * @returns {Promise<Array>} Array of user objects
   */
  static async findAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('User.findAll error:', error);
      throw error;
    }
    return data;
  }

  /**
   * Find user by ID.
   *
   * @param {string} id - The UUID of the user
   * @returns {Promise<object|null>} User object or null if not found
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, profile_image_url, created_at')
      .eq('id', id)
      .single();

    // PGRST116 is "Row not found" - return null instead of throwing
    if (error && error.code !== 'PGRST116') {
      console.error('User.findById error:', error);
    }

    return data || null;
  }

  /**
   * Find user by email.
   *
   * @param {string} email - The email address to search for
   * @returns {Promise<object|null>} User object or null if not found
   */
  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('User.findByEmail error:', error);
    }

    return data || null;
  }

  /**
   * Create a new user record.
   *
   * @param {object} userData - User data { username, email, password }
   * @returns {Promise<object>} Created user object
   */
  static async create(userData) {
    const { username, email, password } = userData;
    // Note: RLS usually allows INSERT with auth.uid() = id check
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, email, password }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update generic user details.
   *
   * @param {string} id - The UUID of the user
   * @param {object} userData - Fields to update { username, email }
   * @returns {Promise<object>} Updated user object
   */
  static async update(id, userData) {
    const { username, email } = userData;
    const { data, error } = await supabase
      .from('users')
      .update({
        username,
        email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update the user's profile picture URL.
   * REQUIRES Access Token to pass RLS.
   *
   * @param {string} id - The UUID of the user
   * @param {string} imageUrl - The relative path to the uploaded image
   * @param {string} accessToken - The user's auth token
   * @returns {Promise<object>} Updated user object
   */
  static async updateAvatar(id, imageUrl, accessToken) {
    console.log(`Supabase Client: Updating avatar for ${id}`);

    // 1. Authenticate this request as the user to pass RLS
    if (accessToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: accessToken,
      });
      if (sessionError)
        console.warn('User.js: Session warning:', sessionError.message);
    }

    // 2. Perform the update
    const { data, error } = await supabase
      .from('users')
      .update({
        profile_image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Update Error:', error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Delete a user record.
   *
   * @param {string} id - The UUID of the user
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  static async delete(id) {
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      console.error('User.delete error:', error);
      return false;
    }
    return true;
  }
}

module.exports = User;
