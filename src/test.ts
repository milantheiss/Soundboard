interface STest {
    name: string;
    age: number;
}

const testSet = new Set<STest>();

const test1 = { name: "Test1", age: 1 };
const test2 = { name: "Test2", age: 2 };

testSet.add(test1);
testSet.add(test2);

console.log("Before", testSet);

testSet.values().

    console.log("After", testSet);



