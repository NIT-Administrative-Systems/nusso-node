class AgentlessWebssoError extends Error {
    constructor(message, status, errorData) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor); // exclude constructor call from stack trace
      this.status = status || 500;
      this.data = errorData;
  
    //   this.logError();
    }
  
    logError() {
      const logOutput = {
        name: this.name,
        status: this.status,
        message: this.message,
        data: this.data,
      };
      console.error('[details]', JSON.stringify(logOutput, null, 2));
    }
  }

module.exports = {
    AgentlessWebssoError,
}