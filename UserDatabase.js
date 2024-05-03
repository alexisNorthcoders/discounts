const fs = require("fs").promises;

class UserDatabase {
  constructor(usersFilePath) {
    this.usersFilePath = usersFilePath;
    this.users = this.loadUsers();
  }

  async loadUsers() {
    try {
      const userData = await fs.readFile(this.usersFilePath, "utf8");
      this.users = JSON.parse(userData).users;
    } catch (error) {
      console.error("Error reading users data:", error);
    }
  }

  async saveUsers() {
    try {
      await fs.writeFile(
        this.usersFilePath,
        JSON.stringify({ users: this.users }, null, 2)
      );
      console.log("Users data saved successfully");
    } catch (error) {
      console.error("Error saving users data:", error);
    }
  }

  getUsers() {
    return this.users;
  }

  async updateUserById(id, updatedData) {
    if (this.users.hasOwnProperty(id)) {
      this.users[id] = { ...this.users[id], ...updatedData };
      await this.saveUsers();
      return true;
    }
    return false;
  }
  async addUser(newUser) {
   
    const randomId = Date.now().toString()
    newUser.id = randomId;
    this.users[randomId] = newUser;
    await this.saveUsers();
}
  async getUserById(id) {
    if (this.users.hasOwnProperty(id)) {
      return this.users[id];
    }
    return null;
  }
  async deleteUserById(id) {
    if (this.users.hasOwnProperty(id)) {
      delete this.users[id];
      await this.saveUsers();
      return true;
    }
    return false;
  }
}
class User {
  constructor(id, username, isSubscribed = false, avatarURL = "") {
    this.id = id;
    this.username = username;
    this.isSubscribed = isSubscribed;
    this.avatarURL = avatarURL;
  }
}
module.exports = UserDatabase;
