const fs = require("fs").promises;

class UserDatabase {
  constructor(usersFilePath) {
    this.usersFilePath = usersFilePath;
    this.users = this.loadUsers();
  }

  async loadUsers() {
    try {
      const userData = await fs.readFile(this.usersFilePath, "utf8");
      this.users = JSON.parse(userData);
    } catch (error) {
      console.error("Error reading users data:", error);
    }
  }

  async saveUsers() {
    try {
      await fs.writeFile(
        this.usersFilePath,
        JSON.stringify(this.users, null, 2)
      );
      console.log("Users data saved successfully");
    } catch (error) {
      console.error("Error saving users data:", error);
    }
  }

  getUsers() {
    return this.users;
  }

  async updateUserById(id, newData) {
    const index = this.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...newData };
      await this.saveUsers();
      return true;
    }
    return false;
  }
  async addUser(newUser) {
    this.users.push(newUser);
    await this.saveUsers();
  }
  async deleteUserById(id) {
    const index = this.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      await this.saveUsers();
      return true; 
    }
    return false;
  }
}

module.exports = UserDatabase;
