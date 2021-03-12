module.exports = async()=>{
    return({
        clearMocks: true,
        preset: "ts-jest",
        maxWorkers: 1,
        testEnvironment: "node",
        setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"]
    });
};