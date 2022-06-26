import express, { Application } from 'express'
import mongoose from 'mongoose'
import compression from 'compression'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'

import Controller from '@/utils/interfaces/controller.interface'
import ErrorMiddleware from '@/middleware/error.middleware'


class App {
  public express: Application
  public port: number

  constructor (controllers: Controller[], port: number) {
    this.express = express()
    this.port = port

    this.initDatabaseConnection()
    this.initMiddleware()
    this.initControllers(controllers)
    this.initErrorHandling()
  }

  // Initialize middlewares.
  private initMiddleware(): void {
    this.express.use(helmet())
    this.express.use(cors())
    this.express.use(morgan('dev'))
    this.express.use(express.json())
    this.express.use(express.urlencoded({ extended: false }))
    this.express.use(compression())
  }

  // Initialize controllers.
  private initControllers(controllers: Controller[]): void {
    controllers.forEach((controller: Controller) => {
      this.express.use('/api', controller.router)
    })
  }

  // Initialize error handling.
  private initErrorHandling(): void {
    this.express.use(ErrorMiddleware)
  }

  // Initialize database connection.
  private initDatabaseConnection(): void {
    const { MONGO_URI } = process.env

    mongoose.connect(MONGO_URI as string)
  }

  // Start server.
  public listen(): void {
    this.express.listen(this.port, () => {
      console.log(`App running on port ${this.port}...`)
    })
  }
}

export default App