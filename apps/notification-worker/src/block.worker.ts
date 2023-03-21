export class BlockChangeWorker {

  public async run(blockId: string) {
    console.log(`[blockWorker] running...`, { blockId });
    // get block details

    // get transaction details

    // get address details

    // send events to queue for live events to client
  }
}