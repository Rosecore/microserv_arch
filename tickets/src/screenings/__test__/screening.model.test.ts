it('implements optimistic concurrency control', async () => {
  // Create an instance of a screening
  const screening = new global.screeningModel({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  // Save the screening to the database
  await screening.save();

  // fetch the screening twice
  const firstInstance = await global.screeningModel.findById(screening.id);
  const secondInstance = await global.screeningModel.findById(screening.id);

  // make two separate changes to the screenings we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save the first fetched screening
  await firstInstance!.save();

  // save the second fetched screening and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const screening = new global.screeningModel({
    title: 'concert',
    price: 20,
    userId: '123',
  });

  await screening.save();
  expect((screening as any).version).toEqual(0);
  await screening.save();
  expect((screening as any).version).toEqual(1);
  await screening.save();
  expect((screening as any).version).toEqual(2);
});
